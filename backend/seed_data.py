from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from models.product import Product, StockMovement
from auth import get_password_hash

def seed_database():
    db = SessionLocal()
    
    try:
        # Create admin user if it doesn't exist
        admin = db.query(User).filter(User.email == "admin@gbsite.com").first()
        
        if not admin:
            admin = User(
                username="admin",
                email="admin@gbsite.com",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            print("✅ Created admin user: admin@gbsite.com / admin123")
        else:
            print("ℹ️ Admin user already exists")
        
        # Create sample products
        sample_products = [
            {
                "id": "arduino-uno",
                "name": "Arduino Uno R3",
                "description": "Placa microcontroladora Arduino Uno R3 original",
                "price": 89.90,
                "stock_quantity": 30,
                "category": "Microcontroladores",
                "image_url": "/images/arduino-uno.jpg"
            },
            {
                "id": "robot-kit-basic",
                "name": "Kit Robótica Básico",
                "description": "Kit completo para iniciantes em robótica com Arduino",
                "price": 299.99,
                "stock_quantity": 50,
                "category": "Kits",
                "image_url": "/images/robot-kit-basic.jpg"
            },
            {
                "id": "sensor-ultrasonic",
                "name": "Sensor Ultrassônico HC-SR04",
                "description": "Sensor de distância ultrassônico para projetos Arduino",
                "price": 25.90,
                "stock_quantity": 100,
                "category": "Sensores",
                "image_url": "/images/sensor-ultrasonic.jpg"
            },
            {
                "id": "motor-servo",
                "name": "Motor Servo SG90",
                "description": "Micro servo motor 9g para projetos de robótica",
                "price": 18.50,
                "stock_quantity": 75,
                "category": "Motores",
                "image_url": "/images/motor-servo.jpg"
            },
            {
                "id": "led-rgb",
                "name": "LED RGB 5mm",
                "description": "LED RGB de 5mm para projetos coloridos",
                "price": 3.50,
                "stock_quantity": 200,
                "category": "Componentes",
                "image_url": "/images/led-rgb.jpg"
            }
        ]
        
        for product_data in sample_products:
            existing_product = db.query(Product).filter(Product.id == product_data["id"]).first()
            
            if not existing_product:
                product = Product(**product_data)
                db.add(product)
                
                # Add initial stock movement
                if admin and product_data["stock_quantity"] > 0:
                    stock_movement = StockMovement(
                        product_id=product.id,
                        movement_type="in",
                        quantity=product_data["stock_quantity"],
                        reason="initial_stock",
                        created_by=admin.id
                    )
                    db.add(stock_movement)
                
                print(f"✅ Created product: {product_data['name']}")
            else:
                print(f"ℹ️ Product already exists: {product_data['name']}")
        
        db.commit()
        print("🎉 Database seeding completed!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()