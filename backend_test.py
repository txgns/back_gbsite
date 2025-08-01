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

    def test_admin_get_stats(self):
        """Test admin get statistics"""
        success, response = self.run_test(
            "Admin Get Stats",
            "GET",
            "admin/stats",
            200,
            use_admin=True
        )
        
        if success and 'total_users' in response:
            print(f"   Total users: {response['total_users']}")
            print(f"   Total orders: {response['total_orders']}")
            print(f"   Total revenue: ${response['total_revenue']}")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            403
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_duplicate_product_creation(self):
        """Test creating product with duplicate ID"""
        product_data = {
            "id": "arduino-uno",  # This ID already exists
            "name": "Duplicate Arduino",
            "description": "This should fail",
            "price": 99.99,
            "stock_quantity": 10,
            "category": "Test",
            "image_url": "test.jpg",
            "is_active": True
        }
        
        success, response = self.run_test(
            "Duplicate Product Creation",
            "POST",
            "products/",
            400,
            data=product_data,
            use_admin=True
        )
        return success

    def test_clear_cart(self):
        """Test clearing cart"""
        success, response = self.run_test(
            "Clear Cart",
            "DELETE",
            "cart/clear",
            200
        )
        return success

    def test_admin_change_user_role(self):
        """Test admin changing user role"""
        if not self.user_id:
            print("❌ No regular user ID available for role change test")
            return False
            
        # Change user role from consumer to admin
        role_data = {"role": "admin"}
        success, response = self.run_test(
            "Admin Change User Role (consumer → admin)",
            "PUT",
            f"admin/users/{self.user_id}/role",
            200,
            data=role_data,
            use_admin=True
        )
        
        if not success:
            return False
            
        # Change back to consumer
        role_data = {"role": "consumer"}
        success2, response2 = self.run_test(
            "Admin Change User Role (admin → consumer)",
            "PUT",
            f"admin/users/{self.user_id}/role",
            200,
            data=role_data,
            use_admin=True
        )
        
        return success and success2

    def test_admin_edit_user_info(self):
        """Test admin editing user information"""
        if not self.user_id:
            print("❌ No regular user ID available for edit test")
            return False
            
        # Update username and email
        from datetime import datetime
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "username": f"edited_user_{timestamp}",
            "email": f"edited_{timestamp}@test.com"
        }
        
        success, response = self.run_test(
            "Admin Edit User Info",
            "PUT",
            f"admin/users/{self.user_id}",
            200,
            data=user_data,
            use_admin=True
        )
        
        if success and 'user' in response:
            print(f"   Updated username: {response['user']['username']}")
            print(f"   Updated email: {response['user']['email']}")
            return True
        return False

    def test_admin_cannot_delete_self(self):
        """Test that admin cannot delete their own account"""
        if not self.admin_user_id:
            print("❌ No admin user ID available for self-deletion test")
            return False
            
        success, response = self.run_test(
            "Admin Cannot Delete Self",
            "DELETE",
            f"admin/users/{self.admin_user_id}",
            400,  # Should return 400 Bad Request
            use_admin=True
        )
        
        if success and 'detail' in response:
            print(f"   Correctly blocked: {response['detail']}")
            return True
        return False

    def test_admin_delete_user(self):
        """Test admin deleting a user (create a test user first)"""
        # First create a test user to delete
        test_user_data = {
            "username": f"delete_me_{datetime.now().strftime('%H%M%S')}",
            "email": f"delete_me_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "DeleteMe123!",
            "role": "consumer"
        }
        
        success, response = self.run_test(
            "Create User for Deletion Test",
            "POST",
            "auth/register",
            201,
            data=test_user_data
        )
        
        if not success or 'user' not in response:
            print("❌ Failed to create test user for deletion")
            return False
            
        test_user_id = response['user']['id']
        print(f"   Created test user with ID: {test_user_id}")
        
        # Now delete the user as admin
        success2, response2 = self.run_test(
            "Admin Delete User",
            "DELETE",
            f"admin/users/{test_user_id}",
            200,
            use_admin=True
        )
        
        return success2

    def test_regular_user_orders_only(self):
        """Test that regular users only see their own orders"""
        # This test uses the regular user token to ensure they only see their orders
        success, response = self.run_test(
            "Regular User Orders (Own Only)",
            "GET",
            "orders/",
            200
        )
        
        if success and 'orders' in response:
            print(f"   User sees {len(response['orders'])} orders")
            # Verify all orders belong to the current user
            for order in response['orders']:
                if 'user_id' in order and order['user_id'] != self.user_id:
                    print(f"❌ User seeing order from different user: {order['user_id']}")
                    return False
            print("   ✅ All orders belong to current user")
            return True
        return False

    def test_admin_sees_all_orders(self):
        """Test that admin can see all orders"""
        success, response = self.run_test(
            "Admin Sees All Orders",
            "GET",
            "orders/",
            200,
            use_admin=True
        )
        
        if success and 'orders' in response:
            print(f"   Admin sees {len(response['orders'])} total orders")
            # Check if orders from different users are visible
            user_ids = set()
            for order in response['orders']:
                if 'user_id' in order:
                    user_ids.add(order['user_id'])
            print(f"   Orders from {len(user_ids)} different users")
            return True
        return False

    def test_client_login_role_check(self):
        """Test that regular client login returns consumer role"""
        client_data = {
            "email": "teste@exemplo.com",
            "password": "senha123456"
        }
        
        success, response = self.run_test(
            "Client Login Role Check",
            "POST",
            "auth/login",
            200,
            data=client_data
        )
        
        if success and 'user' in response:
            user_role = response['user']['role']
            print(f"   Client role: {user_role}")
            if user_role == "consumer":
                print("   ✅ Client has correct consumer role")
                return True
            else:
                print(f"   ❌ Expected 'consumer' role, got '{user_role}'")
                return False
        return False

    def test_admin_login_role_check(self):
        """Test that admin login returns admin role"""
        # This should already be tested in test_admin_login, but let's verify the role specifically
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        success, response = self.run_test(
            "Admin Login Role Verification",
            "GET",
            "auth/me",
            200,
            use_admin=True
        )
        
        if success and 'role' in response:
            admin_role = response['role']
            print(f"   Admin role: {admin_role}")
            if admin_role == "admin":
                print("   ✅ Admin has correct admin role")
                return True
            else:
                print(f"   ❌ Expected 'admin' role, got '{admin_role}'")
                return False
        return False

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
        ("Admin Get Stats", tester.test_admin_get_stats),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access),
        ("Duplicate Product Creation", tester.test_duplicate_product_creation),
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