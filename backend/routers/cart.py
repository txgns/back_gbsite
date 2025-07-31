from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, CartItem
from schemas.user import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse
from auth import get_current_user

router = APIRouter()

@router.get("/", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    total_amount = sum(item.product_price * item.quantity for item in cart_items)
    
    return CartResponse(
        cart_items=[CartItemResponse.from_orm(item) for item in cart_items],
        total_items=len(cart_items),
        total_amount=total_amount
    )

@router.post("/add")
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if item already exists in cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item.quantity
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            **item.dict()
        )
        db.add(cart_item)
    
    db.commit()
    
    return {"message": "Item added to cart successfully"}

@router.put("/update/{item_id}")
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    if item_update.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0"
        )
    
    cart_item.quantity = item_update.quantity
    db.commit()
    
    return {"message": "Cart item updated successfully"}

@router.delete("/remove/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Item removed from cart successfully"}

@router.delete("/clear")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return {"message": "Cart cleared successfully"}