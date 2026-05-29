import requests

url = "https://capstonefullstackb11-production-dcbc.up.railway.app/api/auth/register/"
data = {
    "username": "supertestuser99",
    "email": "supertestuser99@example.com",
    "password": "password123"
}

try:
    res = requests.post(url, json=data)
    print(f"Status: {res.status_code}")
    print(f"Headers: {res.headers}")
    print(f"Text: {res.text}")
except Exception as e:
    print(f"Error: {e}")
