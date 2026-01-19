import requests

def test_admin_found():
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"username": "admin@findit.edu", "password": "pass"}
    response = requests.post(login_url, data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    found_url = "http://127.0.0.1:8000/api/v1/admin/found"
    found_res = requests.get(found_url, headers=headers)
    print(f"Found status: {found_res.status_code}")
    if found_res.status_code == 200:
        print(f"Items returned: {len(found_res.json())}")
    else:
        print(f"Error: {found_res.text}")

if __name__ == "__main__":
    test_admin_found()
