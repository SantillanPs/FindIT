import requests

def test_claims_endpoint():
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"username": "admin@findit.edu", "password": "pass"}
    response = requests.post(login_url, data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    claims_url = "http://127.0.0.1:8000/api/v1/admin/claims/pending"
    claims_res = requests.get(claims_url, headers=headers)
    print(f"Claims status: {claims_res.status_code}")
    if claims_res.status_code == 200:
        claims = claims_res.json()
        if claims:
            first_claim = claims[0]
            print(f"First Claim Keys: {first_claim.keys()}")
            print(f"Category: {first_claim.get('found_item_category')}")
            print(f"Description: {first_claim.get('found_item_description')}")
        else:
            print("No pending claims found.")
    else:
        print(f"Error: {claims_res.text}")

if __name__ == "__main__":
    test_claims_endpoint()
