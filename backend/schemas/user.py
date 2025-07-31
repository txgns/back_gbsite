from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    role: Optional[str] = "consumer"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CartItemBase(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    added_at: datetime
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    cart_items: List[CartItemResponse]
    total_items: int
    total_amount: float