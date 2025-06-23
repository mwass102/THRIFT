from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from config import Config
from utils.database import init_db, mysql
from models.user import User
from models.product import Product
from models.cart import Cart
from models.order import Order
import json

app = Flask(__name__, static_folder='static', static_url_path='')
app.config.from_object(Config())

# Initialize extensions
init_db(app)
jwt = JWTManager(app)

# API Routes

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        user_id = User.create(username, email, password)
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = User.verify_credentials(email, password)
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user['user_id'])
    return jsonify({
        'token': access_token,
        'user': {
            'id': user['user_id'],
            'username': user['username'],
            'email': user['email']
        }
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = Product.get_all()
        return jsonify(products)
    except Exception as e:
        return jsonify({'message': 'Failed to fetch products', 'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.get_by_id(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        return jsonify(product)
    except Exception as e:
        return jsonify({'message': 'Failed to fetch product', 'error': str(e)}), 500

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    try:
        cart_items = Cart.get_user_cart(user_id)
        return jsonify(cart_items)
    except Exception as e:
        return jsonify({'message': 'Failed to fetch cart', 'error': str(e)}), 500

@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({'message': 'Product ID is required'}), 400
    
    try:
        # Verify product exists
        product = Product.get_by_id(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        Cart.add_item(user_id, product_id, quantity)
        return jsonify({'message': 'Product added to cart'}), 201
    except Exception as e:
        return jsonify({'message': 'Failed to add to cart', 'error': str(e)}), 500

@app.route('/api/cart/<int:cart_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_id):
    user_id = get_jwt_identity()
    try:
        # Verify the cart item belongs to the user
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT * FROM cart WHERE cart_id = %s AND user_id = %s",
            (cart_id, user_id)
        )
        if not cursor.fetchone():
            cursor.close()
            return jsonify({'message': 'Cart item not found'}), 404
        
        success = Cart.remove_item(cart_id)
        cursor.close()
        if not success:
            return jsonify({'message': 'Failed to remove item'}), 500
        return jsonify({'message': 'Item removed from cart'})
    except Exception as e:
        return jsonify({'message': 'Failed to remove item', 'error': str(e)}), 500

@app.route('/api/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()
    payment_method = data.get('payment_method')
    
    if not payment_method:
        return jsonify({'message': 'Payment method is required'}), 400
    
    try:
        # Get cart items
        cart_items = Cart.get_user_cart(user_id)
        if not cart_items:
            return jsonify({'message': 'Cart is empty'}), 400
        
        # Calculate total
        total = sum(item['price'] * item['quantity'] for item in cart_items)
        
        # Create order
        order_id = Order.create(user_id, total, payment_method)
        
        # Add order items
        order_items = [{
            'product_id': item['product_id'],
            'quantity': item['quantity'],
            'price': item['price']
        } for item in cart_items]
        
        Order.add_order_items(order_id, order_items)
        
        # Clear cart
        Cart.clear_cart(user_id)
        
        # Simulate payment processing
        # In a real app, you would integrate with payment gateway here
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order_id,
            'total': total,
            'payment_method': payment_method
        })
    except Exception as e:
        return jsonify({'message': 'Checkout failed', 'error': str(e)}), 500

# Serve frontend
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    return app.send_static_file(path)

if __name__ == '__main__':
    app.run(debug=True)