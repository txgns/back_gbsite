import requests
import json
from datetime import datetime

class AdminSpecificTester:
    def __init__(self, base_url="http://127.0.0.1:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.admin_user_data = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if token exists
        if self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        
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

    def test_admin_login_with_role_verification(self):
        """Test admin login and verify role in response"""
        admin_data = {
            "email": "admin@gbsite.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login with Role Verification",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            if 'user' in response:
                self.admin_user_data = response['user']
                print(f"   ✅ Admin user logged in: {response['user']['email']}")
                print(f"   ✅ User role: {response['user']['role']}")
                print(f"   ✅ User ID: {response['user']['id']}")
                
                # Verify role is admin
                if response['user']['role'] == 'admin':
                    print(f"   ✅ Role verification PASSED - User has admin role")
                    return True
                else:
                    print(f"   ❌ Role verification FAILED - Expected 'admin', got '{response['user']['role']}'")
                    return False
            return True
        return False

    def test_admin_stats_endpoint(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats Endpoint",
            "GET",
            "admin/stats",
            200
        )
        
        if success:
            print(f"   📊 Total users: {response.get('total_users', 'N/A')}")
            print(f"   📊 Total orders: {response.get('total_orders', 'N/A')}")
            print(f"   📊 Pending orders: {response.get('pending_orders', 'N/A')}")
            print(f"   📊 Total revenue: ${response.get('total_revenue', 'N/A')}")
            return True
        return False

    def test_admin_users_endpoint(self):
        """Test admin users listing endpoint"""
        success, response = self.run_test(
            "Admin Users Listing",
            "GET",
            "admin/users",
            200
        )
        
        if success and 'users' in response:
            print(f"   👥 Found {len(response['users'])} users")
            print(f"   👥 Total users: {response.get('total', 'N/A')}")
            print(f"   👥 Current page: {response.get('current_page', 'N/A')}")
            return True
        return False

    def test_admin_user_role_update(self):
        """Test admin user role update endpoint"""
        # First get a user to update (not the admin)
        success, users_response = self.run_test(
            "Get Users for Role Update Test",
            "GET",
            "admin/users",
            200
        )
        
        if not success or 'users' not in users_response:
            print("   ❌ Could not get users list for role update test")
            return False
        
        # Find a non-admin user to test role update
        target_user = None
        for user in users_response['users']:
            if user['role'] != 'admin' and user['email'] != 'admin@gbsite.com':
                target_user = user
                break
        
        if not target_user:
            print("   ⚠️  No non-admin user found to test role update")
            return True  # Skip this test
        
        print(f"   🎯 Testing role update for user: {target_user['email']}")
        
        # Test updating role to admin
        role_data = {"role": "admin"}
        success, response = self.run_test(
            f"Update User Role (ID: {target_user['id']})",
            "PUT",
            f"admin/users/{target_user['id']}/role",
            200,
            data=role_data
        )
        
        if success:
            print(f"   ✅ Role update successful: {response.get('message', 'No message')}")
            
            # Revert back to consumer
            revert_data = {"role": "consumer"}
            revert_success, revert_response = self.run_test(
                f"Revert User Role (ID: {target_user['id']})",
                "PUT",
                f"admin/users/{target_user['id']}/role",
                200,
                data=revert_data
            )
            
            if revert_success:
                print(f"   ✅ Role reverted successfully")
            
            return True
        return False

    def test_profile_update_endpoint(self):
        """Test the profile update endpoint with password change"""
        # Test updating profile information
        profile_data = {
            "username": f"admin_updated_{datetime.now().strftime('%H%M%S')}",
            "current_password": "admin123",
            "new_password": "newadmin123"
        }
        
        success, response = self.run_test(
            "Profile Update with Password Change",
            "PUT",
            "users/profile",
            200,
            data=profile_data
        )
        
        if success:
            print(f"   ✅ Profile update successful: {response.get('message', 'No message')}")
            
            # Test login with new password
            new_login_data = {
                "email": "admin@gbsite.com",
                "password": "newadmin123"
            }
            
            login_success, login_response = self.run_test(
                "Login with New Password",
                "POST",
                "auth/login",
                200,
                data=new_login_data
            )
            
            if login_success:
                print(f"   ✅ Login with new password successful")
                
                # Revert password back to original
                revert_data = {
                    "current_password": "newadmin123",
                    "new_password": "admin123"
                }
                
                revert_success, revert_response = self.run_test(
                    "Revert Password Back",
                    "PUT",
                    "users/profile",
                    200,
                    data=revert_data
                )
                
                if revert_success:
                    print(f"   ✅ Password reverted successfully")
                
                return True
            else:
                print(f"   ❌ Login with new password failed")
                return False
        return False

    def test_jwt_token_contains_admin_role(self):
        """Verify JWT token and get current user to check role persistence"""
        success, response = self.run_test(
            "JWT Token Verification - Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   🔑 Current user: {response.get('email', 'N/A')}")
            print(f"   🔑 Current role: {response.get('role', 'N/A')}")
            print(f"   🔑 User ID: {response.get('id', 'N/A')}")
            
            if response.get('role') == 'admin':
                print(f"   ✅ JWT token correctly maintains admin role")
                return True
            else:
                print(f"   ❌ JWT token role mismatch - Expected 'admin', got '{response.get('role')}'")
                return False
        return False

def main():
    print("🔐 Starting Admin-Specific Authentication Tests...")
    print("=" * 60)
    
    tester = AdminSpecificTester("http://127.0.0.1:8001")
    
    # Test sequence focusing on admin authentication
    tests = [
        ("Admin Login & Role Verification", tester.test_admin_login_with_role_verification),
        ("JWT Token Admin Role Persistence", tester.test_jwt_token_contains_admin_role),
        ("Admin Stats Endpoint", tester.test_admin_stats_endpoint),
        ("Admin Users Endpoint", tester.test_admin_users_endpoint),
        ("Admin User Role Update", tester.test_admin_user_role_update),
        ("Profile Update with Password Change", tester.test_profile_update_endpoint),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 ADMIN AUTHENTICATION TEST RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All admin authentication tests passed!")
        return 0
    else:
        print("⚠️  Some admin authentication tests failed!")
        return 1

if __name__ == "__main__":
    main()