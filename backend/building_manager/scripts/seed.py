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


def create_floor(headers, number):
    """Create a floor and return its ID"""
    url = f"{BASE_URL}/api/buildings/floors/"
    payload = {
        "name": f"Floor {number}",
        "number": number,
        "is_deleted": False
    }
    # Check if floor exists or create new (simple create for this script)
    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 201:
        data = response.json()
        print(f"✅ Created Floor {number} (ID: {data['id']})")
        return data['id']
    else:
        print(f"⚠️  Could not create Floor {number} (might already exist): {response.text}")
        # In a real script, you might want to fetch the ID if it exists,
        # but for now we return None to skip unit creation if floor fails
        return None


def create_unit(headers, floor_id, name, unit_type):
    """Create a unit attached to a floor"""
    url = f"{BASE_URL}/api/buildings/units/"
    payload = {
        "floor": floor_id,
        "name": name,
        "unit_type": unit_type,
        "status": "vacant",
        "monthly_rent": "0.00",
        "security_deposit": "0.00"
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 201:
        print(f"   ├─ Created Unit: {name} ({unit_type})")
    else:
        print(f"   └─ ❌ Failed to create Unit {name}: {response.text}")


def main():
    print("--- Starting Corrected Automation ---")

    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    for i in range(1, 7):
        floor_id = create_floor(headers, i)

        if floor_id:
            # --- FLOOR 1 LOGIC (Special Case) ---
            if i == 1:
                # 1. Two Residential Units
                create_unit(headers, floor_id, "1A (East)", "residential")
                create_unit(headers, floor_id, "1B (West)", "residential")

                # 2. Two Shop Units
                create_unit(headers, floor_id, "Shop 01", "shop")
                create_unit(headers, floor_id, "Shop 02", "shop")

            # --- FLOORS 2-6 LOGIC (Standard) ---
            else:
                create_unit(headers, floor_id, f"{i}A (East)", "residential")
                create_unit(headers, floor_id, f"{i}B (West)", "residential")

    print("\n--- Automation Complete ---")


if __name__ == "__main__":
    main()