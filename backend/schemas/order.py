from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    quantity: int

class OrderItemResponse(OrderItemBase):
    id: int
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    status: str = "pending"

class OrderCreate(BaseModel):
    pass  # Will create from cart items

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrdersResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    pages: int
    current_page: int

class OrderWithUserResponse(OrderResponse):
    user: Optional[dict] = None