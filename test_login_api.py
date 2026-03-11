
import requests

def test_admin_login():
    url = "http://localhost:8000/api/auth/admin/login"
    payload = {"email": "admin@dealstore.com", "password": "admin123"}
    try:
        response = requests.post(url, json=payload)
        print(f"Admin Login Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

def test_user_login():
    url = "http://localhost:8000/api/auth/login"
    payload = {"phone": "1230000000", "password": "testpassword"}
    try:
        response = requests.post(url, json=payload)
        print(f"User Login Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    print("Testing Admin Login...")
    test_admin_login()
    print("\nTesting User Login...")
    test_user_login()
