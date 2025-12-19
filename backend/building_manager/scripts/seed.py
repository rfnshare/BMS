import requests
import sys

# --- CONFIGURATION ---
BASE_URL = "http://localhost:8000"
USERNAME = "afaroque"
PASSWORD = "111"


def get_token():
    """Login and retrieve JWT access token"""
    url = f"{BASE_URL}/api/accounts/token/"
    try:
        response = requests.post(url, json={"username": USERNAME, "password": PASSWORD})
        response.raise_for_status()
        return response.json()['access']
    except requests.exceptions.RequestException as e:
        print(f"❌ Login Failed: {e}")
        sys.exit(1)


def create_renter_directly(headers, index):
    """
    Calls /api/renters/ using multipart/form-data.
    """
    url = f"{BASE_URL}/api/renters/"

    # Headers passed from main already contain the Authorization token.
    # We do NOT add Content-Type here; requests adds it automatically for data= payloads.

    username = f"renter_v{index}"
    first_names = ["Arif", "Sultana", "Tanvir", "Nusrat", "Kamal", "Farhana", "Sajid", "Rina", "Imtiaz", "Mitu",
                   "Zahid", "Lubna"]

    # Logic to match your model's GENDER_CHOICES and MARITAL_STATUS_CHOICES
    payload = {
        "username": username,
        "password": "password123",
        "email": f"{username}@example.com",
        "first_name": first_names[index - 1],
        "last_name": "Ahmed",
        "full_name": f"{first_names[index - 1]} Ahmed",
        "phone_number": f"017110000{index:02d}",
        "status": "active",

        # 🔥 FIX: Changed to lowercase keys to match GENDER_CHOICES
        "gender": "male" if index % 2 != 0 else "female",

        # 🔥 FIX: Changed to lowercase keys to match MARITAL_STATUS_CHOICES
        "marital_status": "married" if index > 6 else "single",

        "occupation": "Professional",
        "monthly_income": str(50000 + (index * 2000)),
        "present_address": "Dhaka, Bangladesh",
        "permanent_address": "Village Home",

        # 🔥 FIX: Matches your NotificationPreference.EMAIL value
        "notification_preference": "email"
    }

    # Sending using data= instead of json= triggers multipart/form-data
    response = requests.post(url, data=payload, headers=headers)

    if response.status_code == 201:
        print(f"✅ [{index}/12] Renter created: {username}")
    else:
        print(f"❌ [{index}/12] Failed: {response.status_code} - {response.text}")


def main():
    print("--- Starting Direct Renter API Automation ---")

    token = get_token()

    # 🔥 FIX: Remove "Content-Type" from here.
    # Only provide the Authorization token.
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Generate 12 Renters to trigger pagination and test UI depth
    for i in range(1, 13):
        create_renter_directly(headers, i)

    print("\n--- Automation Complete ---")


if __name__ == "__main__":
    main()