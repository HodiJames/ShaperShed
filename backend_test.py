import requests
import sys
from datetime import datetime
import json

class BookmarkAPITester:
    def __init__(self, base_url="https://acc1b1ec-e058-49e9-aee5-e791a47a9e30.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"   Response: {response.text}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response": response.text[:200] if response.text else ""
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_register_user(self, email, password, firstName, lastName):
        """Test user registration"""
        data = {
            "email": email,
            "password": password,
            "firstName": firstName,
            "lastName": lastName,
            "heard": "testing",
            "lookingFor": "testing bookmarks"
        }
        return self.run_test("User Registration", "POST", "api/auth/register", 200, data)

    def test_login_user(self, email, password):
        """Test user login"""
        data = {
            "email": email,
            "password": password
        }
        return self.run_test("User Login", "POST", "api/auth/login", 200, data)

    def test_get_bookmarks(self, email):
        """Test getting user bookmarks"""
        return self.run_test("Get Bookmarks", "GET", f"api/bookmarks/{email}", 200)

    def test_toggle_bookmark(self, email, listing_id):
        """Test toggling a bookmark"""
        data = {
            "listingId": listing_id
        }
        return self.run_test("Toggle Bookmark", "POST", f"api/bookmarks/{email}/toggle", 200, data)

    def test_duplicate_registration(self, email, password, firstName, lastName):
        """Test duplicate user registration should fail"""
        data = {
            "email": email,
            "password": password,
            "firstName": firstName,
            "lastName": lastName,
            "heard": "testing",
            "lookingFor": "testing bookmarks"
        }
        return self.run_test("Duplicate Registration", "POST", "api/auth/register", 400, data)

    def test_invalid_login(self, email, password):
        """Test login with invalid credentials"""
        data = {
            "email": email,
            "password": password
        }
        return self.run_test("Invalid Login", "POST", "api/auth/login", 401, data)

def main():
    # Setup
    tester = BookmarkAPITester()
    timestamp = datetime.now().strftime('%H%M%S')
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "TestPass123!"
    test_firstName = "Test"
    test_lastName = "User"

    print("🚀 Starting Bookmark API Tests")
    print(f"   Test User: {test_email}")
    print("=" * 50)

    # Test 1: Health check
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test 2: User registration
    reg_success, reg_response = tester.test_register_user(test_email, test_password, test_firstName, test_lastName)
    if not reg_success:
        print("❌ User registration failed, stopping tests")
        return 1

    # Test 3: User login
    login_success, login_response = tester.test_login_user(test_email, test_password)
    if not login_success:
        print("❌ User login failed, stopping tests")
        return 1

    # Test 4: Get empty bookmarks
    bookmarks_success, bookmarks_response = tester.test_get_bookmarks(test_email)
    if not bookmarks_success:
        print("❌ Get bookmarks failed")
    else:
        print(f"   Initial bookmarks: {bookmarks_response.get('savedIds', [])}")

    # Test 5: Add a bookmark
    listing_id = 1  # Using sample listing ID
    toggle_success, toggle_response = tester.test_toggle_bookmark(test_email, listing_id)
    if not toggle_success:
        print("❌ Toggle bookmark failed")
    else:
        print(f"   Bookmark action: {toggle_response.get('action', 'unknown')}")
        print(f"   Updated bookmarks: {toggle_response.get('savedIds', [])}")

    # Test 6: Get bookmarks after adding
    bookmarks_success2, bookmarks_response2 = tester.test_get_bookmarks(test_email)
    if bookmarks_success2:
        print(f"   Bookmarks after adding: {bookmarks_response2.get('savedIds', [])}")

    # Test 7: Remove the bookmark
    toggle_success2, toggle_response2 = tester.test_toggle_bookmark(test_email, listing_id)
    if toggle_success2:
        print(f"   Bookmark action: {toggle_response2.get('action', 'unknown')}")
        print(f"   Updated bookmarks: {toggle_response2.get('savedIds', [])}")

    # Test 8: Test duplicate registration
    tester.test_duplicate_registration(test_email, test_password, test_firstName, test_lastName)

    # Test 9: Test invalid login
    tester.test_invalid_login(test_email, "wrongpassword")

    # Test 10: Test different user bookmarks isolation
    test_email2 = f"test_user2_{timestamp}@example.com"
    reg_success2, _ = tester.test_register_user(test_email2, test_password, "Test2", "User2")
    if reg_success2:
        # Add bookmark for user2
        tester.test_toggle_bookmark(test_email2, 2)  # Different listing
        # Check user1 bookmarks are still separate
        bookmarks_user1, bookmarks_response_user1 = tester.test_get_bookmarks(test_email)
        bookmarks_user2, bookmarks_response_user2 = tester.test_get_bookmarks(test_email2)
        
        if bookmarks_user1 and bookmarks_user2:
            user1_bookmarks = bookmarks_response_user1.get('savedIds', [])
            user2_bookmarks = bookmarks_response_user2.get('savedIds', [])
            print(f"   User1 bookmarks: {user1_bookmarks}")
            print(f"   User2 bookmarks: {user2_bookmarks}")
            
            if user1_bookmarks != user2_bookmarks:
                print("✅ Bookmark isolation working correctly")
                tester.tests_passed += 1
            else:
                print("❌ Bookmark isolation failed")
            tester.tests_run += 1

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())