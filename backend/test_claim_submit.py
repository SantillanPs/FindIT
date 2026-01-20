import requests

def test_claim_submission():
    # Login as a verified student
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"username": "verified@student.edu", "password": "pass"}
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to claim item 4 (which is 'reported')
    claim_url = "http://127.0.0.1:8000/api/v1/claims/submit"
    claim_data = {
        "found_item_id": 4,
        "proof_description": "My book with a blue cover.",
        "proof_photo_url": ""
    }
    res = requests.post(claim_url, json=claim_data, headers=headers)
    print(f"Claim status: {res.status_code}")
    print(f"Response: {res.json()}")

if __name__ == "__main__":
    test_claim_submission()
