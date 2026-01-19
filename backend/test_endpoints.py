import requests

def test_admin_endpoints():
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {
        "username": "admin@findit.edu", # Assuming this is the admin
        "password": "pass" # Assuming this is the password
    }
    
    # login_data might need to be form-encoded for OAuth2PasswordRequestForm
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    stats_url = "http://127.0.0.1:8000/api/v1/admin/stats"
    stats_res = requests.get(stats_url, headers=headers)
    print(f"Stats status: {stats_res.status_code}")
    print(f"Stats body: {stats_res.text}")
    
    found_url = "http://127.0.0.1:8000/api/v1/admin/found"
    found_res = requests.get(found_url, headers=headers)
    print(f"Found status: {found_res.status_code}")
    print(f"Found body: {found_res.text}")

if __name__ == "__main__":
    test_admin_endpoints()
