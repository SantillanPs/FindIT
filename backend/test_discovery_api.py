import requests

def test_discovery_api():
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"username": "admin@findit.edu", "password": "pass"}
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    url = "http://127.0.0.1:8000/api/v1/admin/matches/all"
    res = requests.get(url, headers=headers)
    
    if res.status_code == 200:
        data = res.json()
        if data:
            first_group = data[0]
            found_item = first_group.get("found_item", {})
            print(f"Found Item ID: {found_item.get('id')}")
            print(f"Found Item Category: {found_item.get('category')}")
            print(f"Found Item Private Notes: {found_item.get('private_admin_notes')}")
        else:
            print("No match groups found.")
    else:
        print(f"API Error: {res.status_code}, {res.text}")

if __name__ == "__main__":
    test_discovery_api()
