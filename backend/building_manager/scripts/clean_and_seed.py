import os
import django
import sys

# 1. Setup Django Environment
# Replace 'core' with your actual project folder name where settings.py lives
# 1. Path Setup: Point to the 'dev' file inside the 'settings' folder
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'building_manager.settings.dev')

# 2. Python Path: Tell the script where the root of the project is
# This ensures it can find the 'renters', 'leases', etc. apps
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

# Import all models from your discovered list
from buildings.models import Unit, Floor
from renters.models import Renter
from leases.models import Lease, LeaseRent, RentType
from invoices.models import Invoice
from payments.models import Payment
from expenses.models import Expense
from complaints.models import Complaint
from notifications.models import Notification
from documents.models import LeaseDocument, RenterDocument

User = get_user_model()


def clean_database():
    print("🧹 Cleaning database (Preserving Superadmins)...")

    # Order matters: Delete children first
    Notification.objects.all().delete()
    Complaint.objects.all().delete()
    Payment.objects.all().delete()
    Invoice.objects.all().delete()
    Expense.objects.all().delete()
    LeaseDocument.objects.all().delete()
    RenterDocument.objects.all().delete()
    LeaseRent.objects.all().delete()
    Lease.objects.all().delete()
    Unit.objects.all().delete()
    Floor.objects.all().delete()
    Renter.objects.all().delete()

    # Delete non-superadmin users
    User.objects.filter(is_superuser=False).delete()
    print("✨ Database is now clean.")


def seed_data():
    print("🌱 Seeding E2E Flow Data...")

    # 1. Floor & Unit
    floor, _ = Floor.objects.get_or_create(name="Ground Floor", number=0)
    unit = Unit.objects.create(
        name="A-1",
        floor=floor,
        monthly_rent=Decimal("12000.00"),
        status="available",
        unit_type="Residential"
    )

    # 2. Create Renter User
    renter_user = User.objects.create_user(
        username="renter1",
        password="password123",
        email="renter1@example.com",
        first_name="Farida",
        last_name="Akter",
        is_renter=True,
        is_active=True
    )

    # 3. Create Renter Profile (MAPPED TO YOUR FIELD LIST)
    renter_profile = Renter.objects.create(
        user=renter_user,
        full_name="Farida Akter",
        phone_number="01711223344",
        status="active",  # 👈 Use 'status' instead of 'is_active'
        present_address="Dhaka, Bangladesh",
        occupation="Software Engineer",
        notification_preference="email"
    )

    # 4. Create Rent Types
    rent_type, _ = RentType.objects.get_or_create(name="Monthly Rent")
    water_type, _ = RentType.objects.get_or_create(name="Water Bill")

    # 5. Create Lease
    # Note: If this crashes on is_active, remove that line too
    lease = Lease.objects.create(
        renter=renter_profile,
        unit=unit,
        start_date=timezone.now().date(),
        rent_amount=Decimal("12500.00"),
        security_deposit=Decimal("24000.00"),
        deposit_status="paid",
        status="active"
    )

    # 6. Create Lease Rents
    LeaseRent.objects.create(lease=lease, rent_type=rent_type, amount=Decimal("12000.00"))
    LeaseRent.objects.create(lease=lease, rent_type=water_type, amount=Decimal("500.00"))

    print(f"✅ E2E Setup Ready!")
    print(f"User: renter1 | Pass: password123")


if __name__ == "__main__":
    clean_database()
    seed_data()