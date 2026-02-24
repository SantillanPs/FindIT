import time
import requests

BASE_URL = "http://127.0.0.1:8000"

def wait_for_server():
    print("Waiting for server to be ready (waiting for AI model to load)...")
    for _ in range(30): # Wait up to 5 minutes
        try:
            requests.get(f"{BASE_URL}/auth/me")
            print("Server is ready!")
            return True
        except:
            time.sleep(10)
    return False

def test_task6():
    if not wait_for_server():
        print("Server timed out.")
        return
        
    # Helper to Ensure user exists
    def ensure_user(email, password, role):
        print(f"Ensuring user {email} exists...")
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password, "role": role})

    ensure_user("admin@campus.edu", "adminpassword", "admin")
    ensure_user("finder@student.edu", "password123", "student")
    ensure_user("owner@student.edu", "ownerpass", "student")

    # 1. Login
    print("Logging in...")
    admin_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@campus.edu", "password": "adminpassword"}).json().get("access_token")
    finder_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "finder@student.edu", "password": "password123"}).json().get("access_token")
    owner_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "owner@student.edu", "password": "ownerpass"}).json().get("access_token")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    finder_headers = {"Authorization": f"Bearer {finder_token}"}
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # 2. Complete flow to CLAIMED status
    print("\nFinder reporting a Found Item...")
    found_data = {"category": "Wallets", "description": "Brown leather wallet", "location_zone": "Cafeteria"}
    found_id = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=finder_headers).json().get("id")

    print("\nOwner submitting a claim...")
    claim_data = {"found_item_id": found_id, "proof_description": "My name is Sarah Smith, I lost my brown wallet."}
    claim_id = requests.post(f"{BASE_URL}/claims/submit", json=claim_data, headers=owner_headers).json().get("id")

    print("\nAdmin approving claim...")
    requests.post(f"{BASE_URL}/admin/claims/{claim_id}/review", json={"status": "approved", "admin_notes": "ID matches."}, headers=admin_headers)

    # 3. Task 6: Release the item
    print("\nAdmin logging physical release...")
    owner_id = requests.get(f"{BASE_URL}/auth/me", headers=owner_headers).json().get("id")
    release_data = {
        "released_to_id": owner_id,
        "released_by_name": "Admin John"
    }
    resp = requests.post(f"{BASE_URL}/admin/found/{found_id}/release", json=release_data, headers=admin_headers)
    print(f"Release Status: {resp.status_code}")
    
    if resp.status_code == 200:
        detail = resp.json()
        print(f"Item status: {detail['status']}")
        print(f"Released to ID: {detail['released_to_id']}")
        print(f"Released by: {detail['released_by_name']}")
        print(f"Released at: {detail['released_at']}")
        
        # 4. Verify History
        print("\nVerifying Release History...")
        resp = requests.get(f"{BASE_URL}/admin/found/released", headers=admin_headers)
        history = resp.json()
        print(f"Released items in history: {len(history)}")
        if any(item['id'] == found_id for item in history):
            print("SUCCESS: Release logging verified.")
        else:
            print("FAILED: Item not found in release history.")
    else:
        print(f"FAILED: Release endpoint returned {resp.status_code}. Response: {resp.text}")

if __name__ == "__main__":
    test_task6()
