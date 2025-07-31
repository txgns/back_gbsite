from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from database import get_db
from models.user import User, CartItem
from models.order import Order, OrderItem
from models.product import Product, StockMovement
from schemas.order import OrderResponse, OrdersResponse, OrderUpdate, OrderWithUserResponse
from auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate total amount
    total_amount = sum(item.product_price * item.quantity for item in cart_items)
    
    # Create order
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    
    db.add(order)
    db.flush()  # Get order ID
    
    # Create order items and update stock
    for cart_item in cart_items:
        # Check stock availability
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if product and product.stock_quantity < cart_item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {cart_item.product_name}"
            )
        
        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            product_name=cart_item.product_name,
            product_price=cart_item.product_price,
            quantity=cart_item.quantity
        )
        db.add(order_item)
        
        # Update stock if product exists
        if product:
            product.stock_quantity -= cart_item.quantity
            
            # Record stock movement
            stock_movement = StockMovement(
                product_id=product.id,
                movement_type="out",
                quantity=cart_item.quantity,
                reason="sale",
                reference_id=str(order.id),
                created_by=current_user.id
            )
            db.add(stock_movement)
    
    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(order)
    
    return OrderResponse.from_orm(order)

@router.get("/", response_model=OrdersResponse)
def get_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admin can see all orders, regular users only their own
    if current_user.role == "admin":
        query = db.query(Order)
    else:
        query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    # Include user data for admin view
    orders_data = []
    for order in orders:
        order_dict = OrderResponse.from_orm(order).dict()
        if current_user.role == "admin":
            order_user = db.query(User).filter(User.id == order.user_id).first()
            if order_user:
                order_dict["user"] = {
                    "id": order_user.id,
                    "username": order_user.username,
                    "email": order_user.email
                }
        orders_data.append(order_dict)
    
    return OrdersResponse(
        orders=orders_data,
        total=total,
        pages=math.ceil(total / per_page),
        current_page=page
    )

@router.get("/{order_id}", response_model=OrderWithUserResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user can access this order
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    order_dict = OrderResponse.from_orm(order).dict()
    
    # Include user data for admin view
    if current_user.role == "admin":
        order_user = db.query(User).filter(User.id == order.user_id).first()
        if order_user:
            order_dict["user"] = {
                "id": order_user.id,
                "username": order_user.username,
                "email": order_user.email
            }
    
    return order_dict

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if not order_update.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )
    
    valid_statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
    if order_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    old_status = order.status
    order.status = order_update.status
    
    # If order is cancelled, restore stock
    if order_update.status == "cancelled" and old_status != "cancelled":
        for item in order.order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
                
                # Record stock movement
                stock_movement = StockMovement(
                    product_id=product.id,
                    movement_type="in",
                    quantity=item.quantity,
                    reason="return",
                    reference_id=str(order.id),
                    created_by=current_user.id
                )
                db.add(stock_movement)
    
    db.commit()
    db.refresh(order)
    
    return {
        "message": "Order status updated successfully",
        "order": OrderResponse.from_orm(order)
    }

@router.get("/stats/summary")
def get_order_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Order counts by status
    status_counts = {}
    statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
    
    for status_name in statuses:
        count = db.query(Order).filter(Order.status == status_name).count()
        status_counts[status_name] = count
    
    # Revenue statistics
    paid_statuses = ["paid", "processing", "shipped", "delivered"]
    total_revenue = db.query(Order).filter(Order.status.in_(paid_statuses)).with_entities(
        db.func.sum(Order.total_amount)
    ).scalar() or 0
    
    pending_revenue = db.query(Order).filter(Order.status == "pending").with_entities(
        db.func.sum(Order.total_amount)
    ).scalar() or 0
    
    # Recent orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders_data = []
    for order in recent_orders:
        order_dict = OrderResponse.from_orm(order).dict()
        order_user = db.query(User).filter(User.id == order.user_id).first()
        if order_user:
            order_dict["user"] = {
                "username": order_user.username,
                "email": order_user.email
            }
        recent_orders_data.append(order_dict)
    
    return {
        "status_counts": status_counts,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "recent_orders": recent_orders_data
    }