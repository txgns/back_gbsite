from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    id: str
    stock_quantity: int = 0
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductsResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    pages: int
    current_page: int

class StockUpdateRequest(BaseModel):
    quantity: int  # Positive for increase, negative for decrease
    reason: Optional[str] = "adjustment"

class StockMovementResponse(BaseModel):
    id: int
    product_id: str
    movement_type: str
    quantity: int
    reason: Optional[str]
    reference_id: Optional[str]
    created_at: datetime
    created_by: Optional[int]
    
    class Config:
        from_attributes = True