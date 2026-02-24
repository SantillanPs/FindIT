import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def wait_for_server():
    print("Waiting for server...")
    for _ in range(30):
        try:
            requests.get(f"{BASE_URL}/auth/me")
            return True
        except:
            time.sleep(5)
    return False

def test_hardening():
    if not wait_for_server():
        print("Server timed out.")
        return

    # 1. Register users
    print("Registering users...")
    admin_data = {"email": "admin_h@campus.edu", "password": "pass", "role": "admin"}
    student_data = {"email": "student_h@student.edu", "password": "pass", "role": "student"}
    
    requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    requests.post(f"{BASE_URL}/auth/register", json=student_data)

    # 2. Login
    print("Logging in...")
    admin_token = requests.post(f"{BASE_URL}/auth/login", data={"username": admin_data["email"], "password": admin_data["password"]}).json()["access_token"]
    student_token = requests.post(f"{BASE_URL}/auth/login", data={"username": student_data["email"], "password": student_data["password"]}).json()["access_token"]
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Verify Verification Gate
    print("\nTesting verification gate...")
    found_data = {"category": "Cell Phones", "description": "iPhone 13", "location_zone": "Library"}
    resp = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=student_headers)
    if resp.status_code == 403:
        print("SUCCESS: Unverified student blocked from reporting.")
    else:
        print(f"FAILED: Unverified student not blocked. Status: {resp.status_code}")

    # 4. Admin Verifies Student
    print("\nAdmin verifying student...")
    me = requests.get(f"{BASE_URL}/auth/me", headers=student_headers).json()
    student_id = me["id"]
    requests.put(f"{BASE_URL}/admin/users/{student_id}/verify", json={"is_verified": True}, headers=admin_headers)
    
    # Check again
    resp = requests.post(f"{BASE_URL}/found/report", json=found_data, headers=student_headers)
    if resp.status_code == 200:
        found_id = resp.json()["id"]
        print("SUCCESS: Verified student allowed to report.")
    else:
        print(f"FAILED: Verified student still blocked. Status: {resp.status_code}")

    # 5. Custody Transition
    print("\nTesting custody transition...")
    requests.put(f"{BASE_URL}/admin/found/{found_id}/custody", json={"notes": "Item picked up from library front desk."}, headers=admin_headers)
    item_detail = requests.get(f"{BASE_URL}/admin/found/{found_id}", headers=admin_headers).json()
    print(f"Item status after custody update: {item_detail['status']}")
    if item_detail["status"] == "in_custody":
        print("SUCCESS: Item moved to in_custody.")
    else:
        print("FAILED: Item status not updated.")

    # 6. Matching Pre-filters
    print("\nTesting matching pre-filters...")
    # Report a lost item in a DIFFERENT category
    lost_data = {"category": "Book", "description": "Math textbook", "location_zone": "Library", "private_proof_details": "My name on p1"}
    lost_report = requests.post(f"{BASE_URL}/lost/report", json=lost_data, headers=student_headers).json()
    lost_id = lost_report["id"]
    
    matches = requests.get(f"{BASE_URL}/lost/{lost_id}/matches", headers=student_headers).json()
    print(f"Matches for 'Book' when only 'Cellphone' exists: {len(matches)}")
    if len(matches) == 0:
        print("SUCCESS: Pre-filter blocked non-matching category.")
    else:
        print("FAILED: Pre-filter did not block non-matching category.")

    # Report matching lost item
    lost_data_match = {"category": "Cellphone", "description": "Phone", "location_zone": "Library", "private_proof_details": "FaceID"}
    lost_report_match = requests.post(f"{BASE_URL}/lost/report", json=lost_data_match, headers=student_headers).json()
    matches_match = requests.get(f"{BASE_URL}/lost/{lost_report_match['id']}/matches", headers=student_headers).json()
    print(f"Matches for 'Cellphone': {len(matches_match)}")
    if len(matches_match) > 0:
        print("SUCCESS: Found match after pre-filter.")
    else:
        print("FAILED: No match found for same category.")

    print("\nVerification Complete.")

if __name__ == "__main__":
    test_hardening()
