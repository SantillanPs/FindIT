import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_auth():
    print("Testing Registration...")
    reg_data = {
        "email": "test@student.edu",
        "password": "password123",
        "role": "student"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(f"Register Status: {resp.status_code}")
    print(f"Register Response: {resp.json()}")

    if resp.status_code != 200 and resp.json().get("detail") != "Email already registered":
        return

    print("\nTesting Login...")
    login_data = {
        "username": "test@student.edu",
        "password": "password123"
    }
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Login Status: {resp.status_code}")
    token = resp.json().get("access_token")
    print(f"Token received: {token[:20]}...")

    print("\nTesting Auth Me...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Auth Me Status: {resp.status_code}")
    print(f"Auth Me Response: {resp.json()}")

if __name__ == "__main__":
    test_auth()
