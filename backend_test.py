import requests
import sys
from datetime import datetime
import json

class ListingsAPITester:
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

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

    def test_get_listings(self):
        """Test getting all listings from MongoDB"""
        return self.run_test("Get All Listings", "GET", "api/listings", 200)

    def test_create_listing(self, listing_data):
        """Test creating a single listing"""
        return self.run_test("Create Single Listing", "POST", "api/listings", 200, listing_data)

    def test_bulk_upsert_listings(self, listings_data):
        """Test bulk upsert of listings (CSV import)"""
        return self.run_test("Bulk Upsert Listings", "POST", "api/listings/bulk", 200, listings_data)

    def test_update_listing(self, listing_id, update_data):
        """Test updating a specific listing"""
        return self.run_test("Update Listing", "PUT", f"api/listings/{listing_id}", 200, update_data)

    def test_delete_listing(self, listing_id):
        """Test deleting a listing"""
        return self.run_test("Delete Listing", "DELETE", f"api/listings/{listing_id}", 200)

    def test_update_nonexistent_listing(self, listing_id, update_data):
        """Test updating a non-existent listing should return 404"""
        return self.run_test("Update Non-existent Listing", "PUT", f"api/listings/{listing_id}", 404, update_data)

    def test_delete_nonexistent_listing(self, listing_id):
        """Test deleting a non-existent listing should return 404"""
        return self.run_test("Delete Non-existent Listing", "DELETE", f"api/listings/{listing_id}", 404)

def main():
    # Setup
    tester = ListingsAPITester()
    timestamp = datetime.now().strftime('%H%M%S')
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "TestPass123!"
    test_firstName = "Test"
    test_lastName = "User"

    print("🚀 Starting Listings API Tests")
    print(f"   Test User: {test_email}")
    print("=" * 50)

    # Test 1: Health check
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test 2: Get existing listings
    listings_success, listings_response = tester.test_get_listings()
    if not listings_success:
        print("❌ Get listings failed, stopping tests")
        return 1
    
    existing_listings = listings_response.get('listings', [])
    print(f"   Found {len(existing_listings)} existing listings")

    # Test 3: Create a single listing
    test_listing = {
        "id": 9999,
        "name": "Test Shaper",
        "tagline": "Testing CSV import functionality",
        "category": ["shortboards"],
        "type": "Shaper",
        "featured": False,
        "website": "https://test.com",
        "address": "Test Location",
        "country": "Australia",
        "bio": "This is a test listing for API testing",
        "tags": ["test", "api"],
        "logo": "🧪",
        "logoColor": "#ff0000",
        "logoUrl": "",
        "photos": [],
        "approved": True
    }
    
    create_success, create_response = tester.test_create_listing(test_listing)
    if not create_success:
        print("❌ Create listing failed")
    else:
        print(f"   Created listing: {create_response.get('listing', {}).get('name', 'Unknown')}")

    # Test 4: Bulk upsert listings (CSV import simulation)
    bulk_listings = {
        "listings": [
            {
                "id": 8888,
                "name": "Bulk Test Shaper 1",
                "tagline": "First bulk import test",
                "category": ["longboards"],
                "type": "Shaper",
                "featured": True,
                "country": "USA",
                "address": "California",
                "bio": "Bulk import test listing 1",
                "tags": ["bulk", "test"],
                "logo": "🏄",
                "logoColor": "#0000ff"
            },
            {
                "id": 7777,
                "name": "Bulk Test Shaper 2", 
                "tagline": "Second bulk import test",
                "category": ["mid-lengths"],
                "type": "Glasser",
                "featured": False,
                "country": "Brazil",
                "address": "Rio de Janeiro",
                "bio": "Bulk import test listing 2",
                "tags": ["bulk", "glassing"],
                "logo": "🌊",
                "logoColor": "#00ff00"
            }
        ]
    }
    
    bulk_success, bulk_response = tester.test_bulk_upsert_listings(bulk_listings)
    if not bulk_success:
        print("❌ Bulk upsert failed")
    else:
        print(f"   Bulk import: {bulk_response.get('inserted', 0)} inserted, {bulk_response.get('updated', 0)} updated")

    # Test 5: Update an existing listing
    update_data = {
        "name": "Updated Test Shaper",
        "tagline": "Updated tagline for testing",
        "bio": "This listing has been updated via API"
    }
    
    update_success, _ = tester.test_update_listing(9999, update_data)
    if not update_success:
        print("❌ Update listing failed")

    # Test 6: Get listings again to verify changes
    listings_success2, listings_response2 = tester.test_get_listings()
    if listings_success2:
        updated_listings = listings_response2.get('listings', [])
        print(f"   Total listings after operations: {len(updated_listings)}")
        
        # Find our test listing to verify update
        test_listing_found = next((l for l in updated_listings if l.get('id') == 9999), None)
        if test_listing_found:
            print(f"   Updated listing name: {test_listing_found.get('name')}")

    # Test 7: Delete a test listing
    delete_success, _ = tester.test_delete_listing(7777)
    if not delete_success:
        print("❌ Delete listing failed")

    # Test 8: Try to update non-existent listing (should fail)
    tester.test_update_nonexistent_listing(99999, {"name": "Should not work"})

    # Test 9: Try to delete non-existent listing (should fail)
    tester.test_delete_nonexistent_listing(99999)

    # Test 10: User registration and bookmark functionality (existing tests)
    reg_success, reg_response = tester.test_register_user(test_email, test_password, test_firstName, test_lastName)
    if not reg_success:
        print("❌ User registration failed")
        return 1

    # Test 11: User login
    login_success, login_response = tester.test_login_user(test_email, test_password)
    if not login_success:
        print("❌ User login failed")
        return 1

    # Test 12: Bookmark functionality with listings
    bookmarks_success, bookmarks_response = tester.test_get_bookmarks(test_email)
    if bookmarks_success:
        print(f"   Initial bookmarks: {bookmarks_response.get('savedIds', [])}")

    # Test 13: Add bookmark for our test listing
    toggle_success, toggle_response = tester.test_toggle_bookmark(test_email, 9999)
    if toggle_success:
        print(f"   Bookmark action: {toggle_response.get('action', 'unknown')}")

    # Test 14: Verify bookmark was added
    bookmarks_success2, bookmarks_response2 = tester.test_get_bookmarks(test_email)
    if bookmarks_success2:
        print(f"   Bookmarks after adding: {bookmarks_response2.get('savedIds', [])}")

    # Cleanup: Delete our test listings
    tester.test_delete_listing(9999)
    tester.test_delete_listing(8888)

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