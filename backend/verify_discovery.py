import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_AUTH = ("admin@findit.edu", "pass")

def verify_global_discovery():
    print("Logging in as admin...")
    login_resp = requests.post(f"http://127.0.0.1:8000/api/v1/auth/login", data={"username": "admin@findit.edu", "password": "pass"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\nFetching Global Matches...")
    resp = requests.get(f"{BASE_URL}/admin/matches/all", headers=headers)
    print(f"Status Code: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return
    groups = resp.json()
    
    print(f"Total Groups Found: {len(groups)}")
    
    for i, group in enumerate(groups):
        found = group['found_item']
        max_score = group['max_score']
        print(f"\nRank #{i+1}: {found['category']} (ID: {found['id']})")
        print(f"  Highest Similarity: {max_score*100:.1f}%")
        print(f"  Description: {found['description'][:50]}...")
        
        for m in group['top_matches'][:2]:
            print(f"    - Match {m['similarity_score']*100:.1f}%: {m['item']['description'][:50]}...")

if __name__ == "__main__":
    verify_global_discovery()
