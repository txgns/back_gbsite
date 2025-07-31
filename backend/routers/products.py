from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import math

from database import get_db
from models.user import User
from models.product import Product, StockMovement
from schemas.product import ProductResponse, ProductsResponse, ProductCreate, ProductUpdate, StockUpdateRequest
from auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=ProductsResponse)
def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if active_only:
        query = query.filter(Product.is_active == True)
    
    if category:
        query = query.filter(Product.category == category)
    
    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return ProductsResponse(
        products=[ProductResponse.from_orm(p) for p in products],
        total=total,
        pages=math.ceil(total / per_page),
        current_page=page
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return ProductResponse.from_orm(product)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Check if product ID already exists
    existing_product = db.query(Product).filter(Product.id == product.id).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product ID already exists"
        )
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Record initial stock movement if stock > 0
    if product.stock_quantity > 0:
        stock_movement = StockMovement(
            product_id=db_product.id,
            movement_type="in",
            quantity=product.stock_quantity,
            reason="initial_stock",
            created_by=current_user.id
        )
        db.add(stock_movement)
        db.commit()
    
    return ProductResponse.from_orm(db_product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return ProductResponse.from_orm(product)

@router.put("/{product_id}/stock")
def update_product_stock(
    product_id: str,
    stock_update: StockUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    old_stock = product.stock_quantity
    product.stock_quantity += stock_update.quantity
    
    if product.stock_quantity < 0:
        product.stock_quantity = 0
    
    # Record stock movement
    movement_type = "in" if stock_update.quantity > 0 else "out"
    stock_movement = StockMovement(
        product_id=product.id,
        movement_type=movement_type,
        quantity=abs(stock_update.quantity),
        reason=stock_update.reason,
        created_by=current_user.id
    )
    
    db.add(stock_movement)
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Stock updated successfully",
        "old_stock": old_stock,
        "new_stock": product.stock_quantity,
        "change": stock_update.quantity
    }

@router.get("/categories/list")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).filter(
        Product.category.isnot(None),
        Product.category != "",
        Product.is_active == True
    ).distinct().all()
    
    category_list = [cat[0] for cat in categories if cat[0]]
    
    return {"categories": sorted(category_list)}

@router.get("/low-stock/list")
def get_low_stock_products(
    threshold: int = Query(10, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    products = db.query(Product).filter(
        Product.stock_quantity <= threshold,
        Product.is_active == True
    ).order_by(Product.stock_quantity.asc()).all()
    
    return {
        "products": [ProductResponse.from_orm(p) for p in products],
        "threshold": threshold,
        "count": len(products)
    }