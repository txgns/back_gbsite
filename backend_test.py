import requests
import sys
import json
from datetime import datetime

class GBSiteAPITester:
    def __init__(self, base_url="http://127.0.0.1:8001"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.admin_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if token exists
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'message' in response_data:
                        print(f"   Message: {response_data['message']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                    return False, error_data
                except:
                    print(f"   Response: {response.text}")
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_register_user(self):
        """Test user registration"""
        test_user_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "consumer"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            201,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user']['id']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@gbsite.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            if 'user' in response:
                self.admin_user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_products(self):
        """Test get all products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products/",
            200
        )
        
        if success and 'products' in response:
            print(f"   Found {len(response['products'])} products")
            return True
        return False

    def test_get_product_categories(self):
        """Test get product categories"""
        success, response = self.run_test(
            "Get Product Categories",
            "GET",
            "products/categories/list",
            200
        )
        
        if success and 'categories' in response:
            print(f"   Found categories: {response['categories']}")
            return True
        return False

    def test_add_to_cart(self):
        """Test adding item to cart"""
        cart_data = {
            "product_id": "arduino-uno",
            "product_name": "Arduino Uno R3",
            "product_price": 89.90,
            "quantity": 2
        }
        
        success, response = self.run_test(
            "Add to Cart",
            "POST",
            "cart/add",
            200,
            data=cart_data
        )
        return success

    def test_get_cart(self):
        """Test get cart items"""
        success, response = self.run_test(
            "Get Cart",
            "GET",
            "cart/",
            200
        )
        
        if success and 'cart_items' in response:
            print(f"   Cart has {response['total_items']} items")
            print(f"   Total amount: ${response['total_amount']}")
            return True
        return False

    def test_create_order(self):
        """Test creating an order"""
        order_data = {
            "shipping_address": {
                "street": "123 Test Street",
                "city": "Test City",
                "state": "TS",
                "zip_code": "12345",
                "country": "Test Country"
            },
            "payment_method": "credit_card"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders/",
            201,
            data=order_data
        )
        
        if success and 'order' in response:
            print(f"   Order ID: {response['order']['id']}")
            return True
        return False

    def test_get_user_orders(self):
        """Test get user orders"""
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            "orders/",
            200
        )
        
        if success and 'orders' in response:
            print(f"   Found {len(response['orders'])} orders")
            return True
        return False

    def test_admin_get_all_orders(self):
        """Test admin get all users (since orders endpoint doesn't exist)"""
        success, response = self.run_test(
            "Admin Get All Users",
            "GET",
            "admin/users",
            200,
            use_admin=True
        )
        
        if success and 'users' in response:
            print(f"   Found {len(response['users'])} total users")
            return True
        return False

    def test_admin_create_product(self):
        """Test admin create product"""
        product_data = {
            "id": f"test_product_{datetime.now().strftime('%H%M%S')}",
            "name": "Test Product",
            "description": "A test product for API testing",
            "price": 19.99,
            "stock_quantity": 50,
            "category": "Test Category",
            "image_url": "https://example.com/test.jpg",
            "is_active": True
        }
        
        success, response = self.run_test(
            "Admin Create Product",
            "POST",
            "products/",
            201,
            data=product_data,
            use_admin=True
        )
        
        if success and 'product' in response:
            print(f"   Created product: {response['product']['name']}")
            return True
        return False

    def test_admin_get_low_stock(self):
        """Test admin get low stock products"""
        success, response = self.run_test(
            "Admin Get Low Stock",
            "GET",
            "products/low-stock/list?threshold=20",
            200,
            use_admin=True
        )
        
        if success and 'products' in response:
            print(f"   Found {response['count']} low stock products")
            return True
        return False

    def test_clear_cart(self):
        """Test clearing cart"""
        success, response = self.run_test(
            "Clear Cart",
            "DELETE",
            "cart/clear",
            200
        )
        return success

def main():
    print("🚀 Starting GBSite API Tests...")
    print("=" * 50)
    
    # Setup
    tester = GBSiteAPITester("http://127.0.0.1:8001")
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register_user),
        ("Get Current User", tester.test_get_current_user),
        ("Admin Login", tester.test_admin_login),
        ("Get Products", tester.test_get_products),
        ("Get Product Categories", tester.test_get_product_categories),
        ("Add to Cart", tester.test_add_to_cart),
        ("Get Cart", tester.test_get_cart),
        ("Create Order", tester.test_create_order),
        ("Get User Orders", tester.test_get_user_orders),
        ("Admin Get All Users", tester.test_admin_get_all_orders),
        ("Admin Create Product", tester.test_admin_create_product),
        ("Admin Get Low Stock", tester.test_admin_get_low_stock),
        ("Clear Cart", tester.test_clear_cart),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())