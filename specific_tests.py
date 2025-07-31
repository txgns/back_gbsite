import requests
import json
import jwt
from datetime import datetime, timedelta
import sys

class SpecificGBSiteTests:
    def __init__(self, base_url="http://127.0.0.1:8001"):
        self.base_url = base_url
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED")
        if details:
            print(f"   {details}")
        print()

    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            return response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None

    def test_jwt_token_details(self):
        """Test JWT token contains all required user information and expires in 7 days"""
        print("🔍 Testing JWT Token Details...")
        
        # Login as admin to get token
        login_data = {
            "email": "admin@gbsite.com",
            "password": "admin123"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        if not response or response.status_code != 200:
            self.log_test("JWT Token Test", False, "Failed to login")
            return
        
        login_result = response.json()
        token = login_result.get('access_token')
        
        if not token:
            self.log_test("JWT Token Test", False, "No access token received")
            return
        
        try:
            # Decode JWT token (without verification for testing)
            decoded_token = jwt.decode(token, options={"verify_signature": False})
            
            # Check required fields
            required_fields = ['sub', 'username', 'email', 'role', 'exp']
            missing_fields = [field for field in required_fields if field not in decoded_token]
            
            if missing_fields:
                self.log_test("JWT Token Test", False, f"Missing fields: {missing_fields}")
                return
            
            # Check expiration (should be ~7 days)
            exp_timestamp = decoded_token['exp']
            exp_date = datetime.fromtimestamp(exp_timestamp)
            now = datetime.now()
            days_until_exp = (exp_date - now).days
            
            # Verify user data
            user_data = login_result.get('user', {})
            token_matches_user = (
                decoded_token['username'] == user_data.get('username') and
                decoded_token['email'] == user_data.get('email') and
                decoded_token['role'] == user_data.get('role')
            )
            
            success = (
                len(missing_fields) == 0 and
                5 <= days_until_exp <= 8 and  # Allow some flexibility
                token_matches_user
            )
            
            details = f"Token contains: {list(decoded_token.keys())}, Expires in {days_until_exp} days, User data matches: {token_matches_user}"
            self.log_test("JWT Token Details", success, details)
            
        except Exception as e:
            self.log_test("JWT Token Test", False, f"Token decode error: {str(e)}")

    def test_individual_cart_per_user(self):
        """Test that each user has their own individual cart"""
        print("🔍 Testing Individual Cart Per User...")
        
        # Create two different users
        timestamp = datetime.now().strftime('%H%M%S')
        
        user1_data = {
            "username": f"cartuser1_{timestamp}",
            "email": f"cartuser1_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "consumer"
        }
        
        user2_data = {
            "username": f"cartuser2_{timestamp}",
            "email": f"cartuser2_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "consumer"
        }
        
        # Register user 1
        response1 = self.make_request('POST', 'auth/register', user1_data)
        if not response1 or response1.status_code != 201:
            self.log_test("Individual Cart Test", False, "Failed to register user 1")
            return
        
        user1_result = response1.json()
        self.user1_token = user1_result.get('access_token')
        self.user1_id = user1_result.get('user', {}).get('id')
        
        # Register user 2
        response2 = self.make_request('POST', 'auth/register', user2_data)
        if not response2 or response2.status_code != 201:
            self.log_test("Individual Cart Test", False, "Failed to register user 2")
            return
        
        user2_result = response2.json()
        self.user2_token = user2_result.get('access_token')
        self.user2_id = user2_result.get('user', {}).get('id')
        
        # Add different products to each user's cart
        cart_item1 = {
            "product_id": "arduino-uno",
            "product_name": "Arduino Uno R3",
            "product_price": 89.90,
            "quantity": 2
        }
        
        cart_item2 = {
            "product_id": "raspberry-pi-4",
            "product_name": "Raspberry Pi 4",
            "product_price": 299.90,
            "quantity": 1
        }
        
        # Add item to user 1's cart
        add_response1 = self.make_request('POST', 'cart/add', cart_item1, self.user1_token)
        if not add_response1 or add_response1.status_code != 200:
            self.log_test("Individual Cart Test", False, "Failed to add item to user 1 cart")
            return
        
        # Add item to user 2's cart
        add_response2 = self.make_request('POST', 'cart/add', cart_item2, self.user2_token)
        if not add_response2 or add_response2.status_code != 200:
            self.log_test("Individual Cart Test", False, "Failed to add item to user 2 cart")
            return
        
        # Get user 1's cart
        cart_response1 = self.make_request('GET', 'cart/', token=self.user1_token)
        if not cart_response1 or cart_response1.status_code != 200:
            self.log_test("Individual Cart Test", False, "Failed to get user 1 cart")
            return
        
        # Get user 2's cart
        cart_response2 = self.make_request('GET', 'cart/', token=self.user2_token)
        if not cart_response2 or cart_response2.status_code != 200:
            self.log_test("Individual Cart Test", False, "Failed to get user 2 cart")
            return
        
        cart1_data = cart_response1.json()
        cart2_data = cart_response2.json()
        
        # Verify carts are different
        cart1_items = cart1_data.get('cart_items', [])
        cart2_items = cart2_data.get('cart_items', [])
        
        cart1_has_arduino = any(item.get('product_id') == 'arduino-uno' for item in cart1_items)
        cart2_has_raspberry = any(item.get('product_id') == 'raspberry-pi-4' for item in cart2_items)
        cart1_has_raspberry = any(item.get('product_id') == 'raspberry-pi-4' for item in cart1_items)
        cart2_has_arduino = any(item.get('product_id') == 'arduino-uno' for item in cart2_items)
        
        success = (
            cart1_has_arduino and not cart1_has_raspberry and
            cart2_has_raspberry and not cart2_has_arduino
        )
        
        details = f"User1 cart: {len(cart1_items)} items (Arduino: {cart1_has_arduino}), User2 cart: {len(cart2_items)} items (Raspberry: {cart2_has_raspberry})"
        self.log_test("Individual Cart Per User", success, details)

    def test_checkout_functionality(self):
        """Test complete checkout process"""
        print("🔍 Testing Checkout Functionality...")
        
        if not self.user1_token:
            self.log_test("Checkout Test", False, "No user token available")
            return
        
        # Ensure cart has items (add one if empty)
        cart_item = {
            "product_id": "servo-motor",
            "product_name": "Servo Motor SG90",
            "product_price": 25.90,
            "quantity": 3
        }
        
        add_response = self.make_request('POST', 'cart/add', cart_item, self.user1_token)
        if not add_response or add_response.status_code != 200:
            self.log_test("Checkout Test", False, "Failed to add item to cart for checkout")
            return
        
        # Get cart before checkout
        cart_before = self.make_request('GET', 'cart/', token=self.user1_token)
        if not cart_before or cart_before.status_code != 200:
            self.log_test("Checkout Test", False, "Failed to get cart before checkout")
            return
        
        cart_before_data = cart_before.json()
        items_before = len(cart_before_data.get('cart_items', []))
        total_before = cart_before_data.get('total_amount', 0)
        
        # Create order (checkout)
        order_data = {
            "shipping_address": {
                "street": "Rua das Flores, 123",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01234-567",
                "country": "Brasil"
            },
            "payment_method": "credit_card"
        }
        
        order_response = self.make_request('POST', 'orders/', order_data, self.user1_token)
        if not order_response or order_response.status_code != 201:
            self.log_test("Checkout Test", False, f"Failed to create order: {order_response.status_code if order_response else 'No response'}")
            return
        
        order_result = order_response.json()
        order_id = order_result.get('order', {}).get('id')
        
        # Get cart after checkout (should be empty)
        cart_after = self.make_request('GET', 'cart/', token=self.user1_token)
        if not cart_after or cart_after.status_code != 200:
            self.log_test("Checkout Test", False, "Failed to get cart after checkout")
            return
        
        cart_after_data = cart_after.json()
        items_after = len(cart_after_data.get('cart_items', []))
        
        # Verify order was created and cart was cleared
        success = (
            order_id is not None and
            items_before > 0 and
            items_after == 0
        )
        
        details = f"Order created: {order_id}, Cart items before: {items_before}, after: {items_after}, Total before: ${total_before}"
        self.log_test("Checkout Functionality", success, details)

    def test_admin_functionalities(self):
        """Test admin functionalities"""
        print("🔍 Testing Admin Functionalities...")
        
        # Login as admin
        admin_data = {
            "email": "admin@gbsite.com",
            "password": "admin123"
        }
        
        admin_response = self.make_request('POST', 'auth/login', admin_data)
        if not admin_response or admin_response.status_code != 200:
            self.log_test("Admin Functionalities", False, "Failed to login as admin")
            return
        
        admin_token = admin_response.json().get('access_token')
        
        # Test 1: Change user role
        if self.user2_id:
            role_change_data = {"role": "admin"}
            role_response = self.make_request('PUT', f'admin/users/{self.user2_id}/role', role_change_data, admin_token)
            role_change_success = role_response and role_response.status_code == 200
        else:
            role_change_success = False
        
        # Test 2: Manage stock (get low stock products)
        stock_response = self.make_request('GET', 'products/low-stock/list?threshold=50', token=admin_token)
        stock_success = stock_response and stock_response.status_code == 200
        
        # Test 3: Change order status (get orders first)
        orders_response = self.make_request('GET', 'admin/orders', token=admin_token)
        if orders_response and orders_response.status_code == 200:
            orders_data = orders_response.json()
            orders = orders_data.get('orders', [])
            if orders:
                order_id = orders[0].get('id')
                status_data = {"status": "processing"}
                status_response = self.make_request('PUT', f'admin/orders/{order_id}/status', status_data, admin_token)
                order_status_success = status_response and status_response.status_code == 200
            else:
                order_status_success = True  # No orders to test, but endpoint exists
        else:
            order_status_success = False
        
        success = role_change_success and stock_success and order_status_success
        details = f"Role change: {role_change_success}, Stock management: {stock_success}, Order status: {order_status_success}"
        self.log_test("Admin Functionalities", success, details)

def main():
    print("🚀 Starting Specific GBSite Tests...")
    print("=" * 60)
    
    tester = SpecificGBSiteTests()
    
    # Run specific tests
    tester.test_jwt_token_details()
    tester.test_individual_cart_per_user()
    tester.test_checkout_functionality()
    tester.test_admin_functionalities()
    
    # Print results
    print("=" * 60)
    print(f"📊 SPECIFIC TESTS RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All specific tests passed!")
        return 0
    else:
        print("⚠️  Some specific tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())