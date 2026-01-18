import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_task4():
    # Helper to Ensure user exists
    def ensure_user(email, password, role):
        print(f"Ensuring user {email} exists...")
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password, "role": role})

    ensure_user("test@student.edu", "password123", "student")

    # 1. Login as Student
    print("Logging in as Student...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "test@student.edu", "password": "password123"})
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Report a Found Item (Target for matching)
    print("\nReporting a Found Item (Red Backpack)...")
    found_data = {
        "category": "Bags",
        "description": "A bright red backpack with black straps",
        "location_zone": "Student Center",
        "private_admin_notes": "Contains a math textbook."
    }
    requests.post(f"{BASE_URL}/found/report", json=found_data, headers=headers)

    # 3. Report another Found Item (Noise)
    print("Reporting another Found Item (Blue Wallet)...")
    noise_data = {
        "category": "Wallets",
        "description": "Small blue leather wallet",
        "location_zone": "Library",
        "private_admin_notes": "ID inside: John Doe."
    }
    requests.post(f"{BASE_URL}/found/report", json=noise_data, headers=headers)

    # 4. Report a Lost Item (Query)
    print("\nReporting a Lost Item (Crimson bag)...")
    lost_data = {
        "category": "Bags",
        "description": "I lost my crimson colored bag, it might be in the student hub",
        "location_zone": "Student Hub",
        "private_proof_details": "My name is written on the inner tag."
    }
    resp = requests.post(f"{BASE_URL}/lost/report", json=lost_data, headers=headers)
    lost_id = resp.json().get("id")
    print(f"Lost Report ID: {lost_id}")

    # 5. Get Matches
    print("\nFetching match suggestions for the lost bag...")
    resp = requests.get(f"{BASE_URL}/lost/{lost_id}/matches", headers=headers)
    if resp.status_code != 200:
        print(f"FAILED: Match request failed with status {resp.status_code}")
        print(f"Response: {resp.text}")
        return

    matches = resp.json()
    print(f"Found {len(matches)} matches.")
    for idx, match in enumerate(matches):
        item = match['item']
        score = match['similarity_score']
        print(f"{idx+1}. [{score:.4f}] {item['category']}: {item['description']}")

    # Verification: First match should be the backpack
    if matches and matches[0]['item']['category'] == "Bags":
        print("\nSUCCESS: The best match is correct!")
    else:
        print("\nFAILED: Matches did not meet expectations.")

if __name__ == "__main__":
    test_task4()
