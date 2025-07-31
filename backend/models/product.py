from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    category = Column(String(100))
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    stock_movements = relationship("StockMovement", back_populates="product")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    movement_type = Column(String(20), nullable=False)  # 'in', 'out', 'adjustment'
    quantity = Column(Integer, nullable=False)
    reason = Column(String(200))  # 'sale', 'restock', 'adjustment', 'return'
    reference_id = Column(String(50))  # Order ID or other reference
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    product = relationship("Product", back_populates="stock_movements")