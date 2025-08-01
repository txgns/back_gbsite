from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import math

from database import get_db
from models.user import User, CartItem
from models.order import Order
from schemas.user import UserResponse
from auth import get_current_admin_user

router = APIRouter()

@router.get("/users")
def get_all_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total = db.query(User).count()
    users = db.query(User).offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "users": [UserResponse.from_orm(user) for user in users],
        "total": total,
        "pages": math.ceil(total / per_page),
        "current_page": page
    }

@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's orders
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    return {
        "user": UserResponse.from_orm(user),
        "orders": [{"id": order.id, "total_amount": order.total_amount, "status": order.status, "created_at": order.created_at} for order in orders],
        "total_orders": len(orders)
    }

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    role = role_data.get("role")
    if not role or role not in ["admin", "consumer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin' or 'consumer'"
        )
    
    user.role = role
    db.commit()
    
    return {"message": "User role updated successfully"}

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total_users = db.query(User).count()
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == "pending").count()
    total_revenue = db.query(Order).filter(Order.status.in_(["paid", "processing", "shipped", "delivered"])).with_entities(
        func.sum(Order.total_amount)
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_revenue": float(total_revenue)
    }