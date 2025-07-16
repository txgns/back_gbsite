from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Order, OrderItem, CartItem
from src.models.product import Product, StockMovement
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

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

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order from cart items"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's cart items
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        
        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Calculate total amount
        total_amount = sum(item.product_price * item.quantity for item in cart_items)
        
        # Create order
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            status='pending'
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update stock
        for cart_item in cart_items:
            # Check stock availability
            product = Product.query.get(cart_item.product_id)
            if product and not product.is_in_stock(cart_item.quantity):
                db.session.rollback()
                return jsonify({'error': f'Insufficient stock for {cart_item.product_name}'}), 400
            
            # Create order item
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product_name,
                product_price=cart_item.product_price,
                quantity=cart_item.quantity
            )
            db.session.add(order_item)
            
            # Update stock if product exists
            if product:
                product.update_stock(-cart_item.quantity)
                
                # Record stock movement
                stock_movement = StockMovement(
                    product_id=product.id,
                    movement_type='out',
                    quantity=cart_item.quantity,
                    reason='sale',
                    reference_id=str(order.id),
                    created_by=user_id
                )
                db.session.add(stock_movement)
        
        # Clear cart
        CartItem.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """Get user's orders or all orders (admin)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        # Admin can see all orders, regular users only their own
        if user.is_admin():
            query = Order.query
        else:
            query = Order.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        orders = query.order_by(Order.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Include user data for admin view
        orders_data = []
        for order in orders.items:
            order_dict = order.to_dict()
            if user.is_admin():
                order_user = User.query.get(order.user_id)
                order_dict['user'] = {
                    'id': order_user.id,
                    'username': order_user.username,
                    'email': order_user.email
                } if order_user else None
            orders_data.append(order_dict)
        
        return jsonify({
            'orders': orders_data,
            'total': orders.total,
            'pages': orders.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get specific order details"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if user can access this order
        if not user.is_admin() and order.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        order_dict = order.to_dict()
        
        # Include user data for admin view
        if user.is_admin():
            order_user = User.query.get(order.user_id)
            order_dict['user'] = {
                'id': order_user.id,
                'username': order_user.username,
                'email': order_user.email
            } if order_user else None
        
        return jsonify({'order': order_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
    """Update order status (admin only)"""
    try:
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        status = data['status']
        valid_statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
        
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        old_status = order.status
        order.status = status
        order.updated_at = datetime.utcnow()
        
        # If order is cancelled, restore stock
        if status == 'cancelled' and old_status != 'cancelled':
            user_id = int(get_jwt_identity())
            for item in order.order_items:
                product = Product.query.get(item.product_id)
                if product:
                    product.update_stock(item.quantity)
                    
                    # Record stock movement
                    stock_movement = StockMovement(
                        product_id=product.id,
                        movement_type='in',
                        quantity=item.quantity,
                        reason='return',
                        reference_id=str(order.id),
                        created_by=user_id
                    )
                    db.session.add(stock_movement)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order status updated successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_order_stats():
    """Get order statistics (admin only)"""
    try:
        # Order counts by status
        status_counts = {}
        statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
        
        for status in statuses:
            count = Order.query.filter_by(status=status).count()
            status_counts[status] = count
        
        # Revenue statistics
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).filter(
            Order.status.in_(['paid', 'processing', 'shipped', 'delivered'])
        ).scalar() or 0
        
        pending_revenue = db.session.query(db.func.sum(Order.total_amount)).filter_by(
            status='pending'
        ).scalar() or 0
        
        # Recent orders
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
        recent_orders_data = []
        for order in recent_orders:
            order_dict = order.to_dict()
            order_user = User.query.get(order.user_id)
            order_dict['user'] = {
                'username': order_user.username,
                'email': order_user.email
            } if order_user else None
            recent_orders_data.append(order_dict)
        
        return jsonify({
            'status_counts': status_counts,
            'total_revenue': float(total_revenue),
            'pending_revenue': float(pending_revenue),
            'recent_orders': recent_orders_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

