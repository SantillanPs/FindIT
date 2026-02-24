import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_found_items():
    # 1. Login as Student
    print("Logging in as Student...")
    login_data = {"username": "test@student.edu", "password": "password123"}
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    student_token = resp.json().get("access_token")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Report Found Item
    print("\nReporting Found Item...")
    found_data = {
        "category": "Cellphone",
        "description": "Blue wireless earbuds in a black case",
        "category": "Wallets", "description": "Brown leather wallet", "location_zone": "Cafeteria"
    }
    resp = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=student_headers)
    print(f"Report Status: {resp.status_code}")
    item_id = resp.json().get("id")
    print(f"Report Response: {resp.json()}")

    # 3. List Found Items (Public)
    print("\nListing Found Items (Public)...")
    resp = requests.get(f"{BASE_URL}/found/list")
    print(f"List Status: {resp.status_code}")
    print(f"List Items: {resp.json()}")

    # 4. Try Admin Access with Student Account (Should Fail)
    print("\nTesting Student Access to Admin Details (Expected to Fail)...")
    resp = requests.get(f"{BASE_URL}/admin/found/detail/{item_id}", headers=student_headers)
    print(f"Admin Detail (Student): {resp.status_code} - {resp.json().get('detail')}")

    # 5. Register & Login as Admin
    print("\nRegistering Admin...")
    admin_reg = {"email": "admin@campus.edu", "password": "adminpassword", "role": "admin"}
    requests.post(f"{BASE_URL}/auth/register", json=admin_reg)
    
    print("Logging in as Admin...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@campus.edu", "password": "adminpassword"})
    admin_token = resp.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 6. Admin Access Detail
    print("\nTesting Admin Access to Detail...")
    resp = requests.get(f"{BASE_URL}/admin/found/detail/{item_id}", headers=admin_headers)
    print(f"Admin Detail Status: {resp.status_code}")
    print(f"Admin Detail Response: {resp.json()}")

if __name__ == "__main__":
    test_found_items()
