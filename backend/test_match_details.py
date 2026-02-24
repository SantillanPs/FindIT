import requests
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_match_details():
    print("Logging in as admin...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@findit.edu", "password": "pass"})
    if admin_login.status_code != 200:
        print(f"Login failed: {admin_login.text}")
        return
    admin_token = admin_login.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    print("\nCreating a matching lost item report...")
    lost_data = {
        "item_name": "iPhone 13",
        "description": "Lost my blue iPhone 13",
        "category": "Cellphone",
        "location_zone": "Library",
        "last_seen_time": datetime.utcnow().isoformat()
    }
    # Using verified student for lost report
    student_login = requests.post(f"{BASE_URL}/auth/login", data={"username": "verified@student.edu", "password": "pass"})
    student_token = student_login.json().get("access_token")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    requests.post(f"{BASE_URL}/lost/report", json=lost_data, headers=student_headers)

    print("\nFetching found items...")
    found_items = requests.get(f"{BASE_URL}/admin/found", headers=admin_headers).json()
    if not found_items:
        print("No found items to test with.")
        return
    
    item_id = found_items[0]['id']
    print(f"Analyzing matches for item #{item_id}...")
    
    resp = requests.get(f"{BASE_URL}/admin/found/{item_id}/matches", headers=admin_headers)
    matches = resp.json()
    print(f"Raw matches: {matches}")
    
    if not matches:
        print("No matches found for this item.")
        return
    
    match = matches[0]
    lost_id = match['item']['id']
    print(f"\nConnecting match: Found #{item_id} <-> Lost #{lost_id}")
    
    connect_resp = requests.post(
        f"{BASE_URL}/admin/matches/connect", 
        json={"found_item_id": item_id, "lost_item_id": lost_id}, 
        headers=admin_headers
    )
    print(f"Connection response: {connect_resp.json()}")

    print("\nVerifying notifications for OWNER (User 2)...")
    owner_notifs = requests.get(f"{BASE_URL}/notifications", headers=student_headers).json()
    print(f"Owner notifications: {[n['title'] for n in owner_notifs]}")
    
    # Also verify finder (User 1 - admin in seed)
    print("\nVerifying notifications for FINDER (Admin user)...")
    finder_notifs = requests.get(f"{BASE_URL}/notifications", headers=admin_headers).json()
    print(f"Finder notifications: {[n['title'] for n in finder_notifs]}")

if __name__ == "__main__":
    test_match_details()
