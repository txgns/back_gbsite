from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User
from src.models.product import Product, StockMovement
from datetime import datetime

products_bp = Blueprint('products', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all products (public endpoint)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        query = Product.query
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        products = query.order_by(Product.name).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>', methods=['GET'])
def get_product(product_id):
    """Get specific product details"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({'product': product.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_product():
    """Create a new product (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['id', 'name', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if product ID already exists
        existing_product = Product.query.get(data['id'])
        if existing_product:
            return jsonify({'error': 'Product ID already exists'}), 400
        
        product = Product(
            id=data['id'],
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            stock_quantity=int(data.get('stock_quantity', 0)),
            category=data.get('category', ''),
            image_url=data.get('image_url', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(product)
        
        # Record initial stock movement if stock > 0
        if product.stock_quantity > 0:
            user_id = int(get_jwt_identity())
            stock_movement = StockMovement(
                product_id=product.id,
                movement_type='in',
                quantity=product.stock_quantity,
                reason='initial_stock',
                created_by=user_id
            )
            db.session.add(stock_movement)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_product(product_id):
    """Update product details (admin only)"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = float(data['price'])
        if 'category' in data:
            product.category = data['category']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'is_active' in data:
            product.is_active = data['is_active']
        
        product.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>/stock', methods=['PUT'])
@jwt_required()
@admin_required
def update_stock(product_id):
    """Update product stock (admin only)"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        
        if 'quantity' not in data:
            return jsonify({'error': 'Quantity is required'}), 400
        
        quantity_change = int(data['quantity'])
        reason = data.get('reason', 'adjustment')
        
        old_stock = product.stock_quantity
        product.update_stock(quantity_change)
        
        # Record stock movement
        user_id = int(get_jwt_identity())
        movement_type = 'in' if quantity_change > 0 else 'out'
        stock_movement = StockMovement(
            product_id=product.id,
            movement_type=movement_type,
            quantity=abs(quantity_change),
            reason=reason,
            created_by=user_id
        )
        db.session.add(stock_movement)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Stock updated successfully',
            'old_stock': old_stock,
            'new_stock': product.stock_quantity,
            'change': quantity_change
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>/stock/movements', methods=['GET'])
@jwt_required()
@admin_required
def get_stock_movements(product_id):
    """Get stock movement history for a product (admin only)"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        movements = StockMovement.query.filter_by(product_id=product_id).order_by(
            StockMovement.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        movements_data = []
        for movement in movements.items:
            movement_dict = movement.to_dict()
            if movement.user:
                movement_dict['created_by_user'] = movement.user.username
            movements_data.append(movement_dict)
        
        return jsonify({
            'movements': movements_data,
            'total': movements.total,
            'pages': movements.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/low-stock', methods=['GET'])
@jwt_required()
@admin_required
def get_low_stock_products():
    """Get products with low stock (admin only)"""
    try:
        threshold = request.args.get('threshold', 10, type=int)
        
        products = Product.query.filter(
            Product.stock_quantity <= threshold,
            Product.is_active == True
        ).order_by(Product.stock_quantity.asc()).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'threshold': threshold,
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    try:
        categories = db.session.query(Product.category).filter(
            Product.category.isnot(None),
            Product.category != '',
            Product.is_active == True
        ).distinct().all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({'categories': sorted(category_list)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

