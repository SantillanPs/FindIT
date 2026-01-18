import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_task3():
    # Helper to Ensure user exists
    def ensure_user(email, password, role):
        print(f"Ensuring user {email} exists...")
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password, "role": role})

    ensure_user("admin@campus.edu", "adminpassword", "admin")
    ensure_user("test@student.edu", "password123", "student")

    # 1. Login as Admin
    print("Logging in as Admin...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@campus.edu", "password": "adminpassword"})
    admin_token = resp.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Login as Student
    print("Logging in as Student...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "test@student.edu", "password": "password123"})
    student_token = resp.json().get("access_token")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Report Found Item
    print("\nReporting Found Item (this will trigger AI embedding generation)...")
    found_data = {
        "category": "Keys",
        "description": "Keychain with a small silver bell",
        "location_zone": "Cafeteria",
        "private_admin_notes": "Found near the trash can."
    }
    resp = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=student_headers)
    print(f"Report Status: {resp.status_code}")
    item_id = resp.json().get("id")
    print(f"Item ID: {item_id}")

    # 4. Check Admin Detail for embedding
    print("\nVerifying Embedding in Database...")
    resp = requests.get(f"{BASE_URL}/admin/found/detail/{item_id}", headers=admin_headers)
    detail = resp.json()
    embedding_str = detail.get("embedding")
    
    if embedding_str:
        embedding = json.loads(embedding_str)
        print(f"SUCCESS: Embedding found!")
        print(f"Embedding length: {len(embedding)}")
        print(f"First 3 values: {embedding[:3]}")
    else:
        print("FAILED: No embedding found in database.")

if __name__ == "__main__":
    test_task3()
