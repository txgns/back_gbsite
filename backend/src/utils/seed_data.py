from src.models.user import db, User
from src.models.product import Product, StockMovement
from datetime import datetime

def seed_admin_user():
    """Create default admin user if it doesn't exist"""
    admin = User.query.filter_by(email='admin@gbsite.com').first()
    
    if not admin:
        admin = User(
            username='admin',
            email='admin@gbsite.com',
            role='admin'
        )
        admin.set_password('admin123')  # Change this in production
        db.session.add(admin)
        print("Created admin user: admin@gbsite.com / admin123")
    else:
        print("Admin user already exists")

def seed_sample_products():
    """Create sample products for testing"""
    sample_products = [
        {
            'id': 'robot-kit-basic',
            'name': 'Kit Robótica Básico',
            'description': 'Kit completo para iniciantes em robótica com Arduino',
            'price': 299.99,
            'stock_quantity': 50,
            'category': 'Kits',
            'image_url': '/images/robot-kit-basic.jpg'
        },
        {
            'id': 'sensor-ultrasonic',
            'name': 'Sensor Ultrassônico HC-SR04',
            'description': 'Sensor de distância ultrassônico para projetos Arduino',
            'price': 25.90,
            'stock_quantity': 100,
            'category': 'Sensores',
            'image_url': '/images/sensor-ultrasonic.jpg'
        },
        {
            'id': 'motor-servo',
            'name': 'Motor Servo SG90',
            'description': 'Micro servo motor 9g para projetos de robótica',
            'price': 18.50,
            'stock_quantity': 75,
            'category': 'Motores',
            'image_url': '/images/motor-servo.jpg'
        },
        {
            'id': 'arduino-uno',
            'name': 'Arduino Uno R3',
            'description': 'Placa microcontroladora Arduino Uno R3 original',
            'price': 89.90,
            'stock_quantity': 30,
            'category': 'Microcontroladores',
            'image_url': '/images/arduino-uno.jpg'
        },
        {
            'id': 'led-rgb',
            'name': 'LED RGB 5mm',
            'description': 'LED RGB de 5mm para projetos coloridos',
            'price': 3.50,
            'stock_quantity': 200,
            'category': 'Componentes',
            'image_url': '/images/led-rgb.jpg'
        }
    ]
    
    admin = User.query.filter_by(role='admin').first()
    
    for product_data in sample_products:
        existing_product = Product.query.get(product_data['id'])
        
        if not existing_product:
            product = Product(**product_data)
            db.session.add(product)
            
            # Add initial stock movement
            if admin and product_data['stock_quantity'] > 0:
                stock_movement = StockMovement(
                    product_id=product.id,
                    movement_type='in',
                    quantity=product_data['stock_quantity'],
                    reason='initial_stock',
                    created_by=admin.id
                )
                db.session.add(stock_movement)
            
            print(f"Created product: {product_data['name']}")
        else:
            print(f"Product already exists: {product_data['name']}")

def seed_all():
    """Seed all initial data"""
    print("Seeding database...")
    seed_admin_user()
    seed_sample_products()
    db.session.commit()
    print("Database seeding completed!")

if __name__ == '__main__':
    from src.main import app
    with app.app_context():
        seed_all()

