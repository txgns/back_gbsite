from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
from typing import List, Optional

from database import get_db, engine
from models import user, product, order
from routers import auth, users, products, cart, orders, admin
from auth import get_current_user

# Create tables
user.Base.metadata.create_all(bind=engine)
product.Base.metadata.create_all(bind=engine)
order.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GBSite API",
    description="E-commerce API para produtos de robótica",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "GBSite API is running"}

@app.get("/")
async def root():
    return {"message": "GBSite API - Acesse /docs para documentação"}

if __name__ == "__main__":
    # Seed initial data
    from seed_data import seed_database
    seed_database()
    
    print("🚀 Starting GBSite FastAPI Backend...")
    print("📍 Backend URL: http://127.0.0.1:8001")
    print("📚 API Docs: http://127.0.0.1:8001/docs")
    print("🔑 Admin Login: admin@gbsite.com / admin123")
    print("-" * 50)
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=True,
        log_level="info"
    )