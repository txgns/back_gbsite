from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, CartItem

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart items"""
    try:
        user_id = int(get_jwt_identity())
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'cart_items': [item.to_dict() for item in cart_items],
            'total_items': len(cart_items),
            'total_amount': sum(item.product_price * item.quantity for item in cart_items)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not all(k in data for k in ['product_id', 'product_name', 'product_price']):
            return jsonify({'error': 'Product ID, name, and price are required'}), 400
        
        product_id = data['product_id']
        product_name = data['product_name']
        product_price = float(data['product_price'])
        quantity = int(data.get('quantity', 1))
        
        # Check if item already exists in cart
        existing_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
        else:
            # Create new cart item
            cart_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                product_name=product_name,
                product_price=product_price,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Item added to cart successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """Update cart item quantity"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'quantity' not in data:
            return jsonify({'error': 'Quantity is required'}), 400
        
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400
        
        cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        cart_item.quantity = quantity
        db.session.commit()
        
        return jsonify({'message': 'Cart item updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Remove item from cart"""
    try:
        user_id = int(get_jwt_identity())
        cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    try:
        user_id = int(get_jwt_identity())
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Cart cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

