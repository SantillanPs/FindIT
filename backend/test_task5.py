import requests

BASE_URL = "http://127.0.0.1:8000"

def test_task5():
    # Helper to Ensure user exists
    def ensure_user(email, password, role):
        print(f"Ensuring user {email} exists...")
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password, "role": role})

    ensure_user("admin@campus.edu", "adminpassword", "admin")
    ensure_user("finder@student.edu", "password123", "student")
    ensure_user("claimant@student.edu", "claimantpass", "student")

    # 1. Login
    print("Logging in...")
    admin_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@campus.edu", "password": "adminpassword"}).json().get("access_token")
    finder_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "finder@student.edu", "password": "password123"}).json().get("access_token")
    claimant_token = requests.post(f"{BASE_URL}/auth/login", data={"username": "claimant@student.edu", "password": "claimantpass"}).json().get("access_token")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    finder_headers = {"Authorization": f"Bearer {finder_token}"}
    claimant_headers = {"Authorization": f"Bearer {claimant_token}"}

    # 2. Finder reports an item
    print("\nFinder reporting a Found Item...")
    found_data = {
        "category": "Electronics",
        "description": "Black Bose Headphones",
        "location_zone": "Gym",
        "private_admin_notes": "Left ear cushion is slightly torn."
    }
    resp = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=finder_headers)
    found_id = resp.json().get("id")
    print(f"Found Item ID: {found_id}")

    # 3. Claimant submits a claim
    print("\nClaimant submitting a claim...")
    claim_data = {
        "found_item_id": found_id,
        "proof_description": "I lost my Bose headphones at the Gym. They have a torn ear cushion."
    }
    resp = requests.post(f"{BASE_URL}/claims/submit", json=claim_data, headers=claimant_headers)
    claim_id = resp.json().get("id")
    print(f"Claim ID: {claim_id}")

    # 4. Admin reviews pending claims
    print("\nAdmin checking pending claims...")
    resp = requests.get(f"{BASE_URL}/admin/claims/pending", headers=admin_headers)
    pending_claims = resp.json()
    print(f"Pending claims count: {len(pending_claims)}")

    # 5. Admin approves the claim
    print("\nAdmin approving claim...")
    review_data = {
        "status": "approved",
        "admin_notes": "Proof matches the private notes about the ear cushion."
    }
    resp = requests.post(f"{BASE_URL}/admin/claims/{claim_id}/review", json=review_data, headers=admin_headers)
    print(f"Review Status: {resp.status_code}")
    print(f"Claim final status: {resp.json().get('status')}")

    # 6. Verify found item status
    print("\nVerifying Found Item status...")
    resp = requests.get(f"{BASE_URL}/found/list")
    for item in resp.json():
        if item['id'] == found_id:
            print(f"Item {found_id} status: {item['status']}")
            if item['status'] == "claimed":
                print("SUCCESS: Claim workflow verified.")
            else:
                print("FAILED: Item status did not update to 'claimed'.")

if __name__ == "__main__":
    test_task5()
