import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.user import db
from src.models.product import Product, StockMovement
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.cart import cart_bp
from src.routes.admin import admin_bp
from src.routes.orders import orders_bp
from src.routes.products import products_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'src', 'static'))

# Configuration from environment variables
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string-gbsite-2024')

# Enable CORS for all routes
CORS(app, origins=["*"])

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints with /api prefix
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(products_bp, url_prefix='/api/products')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///gbsite.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables and seed data
with app.app_context():
    db.create_all()
    from src.utils.seed_data import seed_admin_user, seed_sample_products
    seed_admin_user()
    seed_sample_products()
    db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Health check endpoint
@app.route('/api/health')
def health_check():
    return {'status': 'ok', 'message': 'GBSite API is running'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)