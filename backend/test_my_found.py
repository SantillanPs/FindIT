import requests

def test_my_found_reports():
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"username": "santillan@gmail.com", "password": "password"} # I assume the password
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    url = "http://127.0.0.1:8000/api/v1/found/my-reports"
    res = requests.get(url, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.json()}")

if __name__ == "__main__":
    test_my_found_reports()
