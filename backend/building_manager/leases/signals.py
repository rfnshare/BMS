from django.db.models.signals import post_save
from django.dispatch import receiver
from leases.models import Lease
from invoices.models import Invoice
from buildings.models import Unit
from renters.models import Renter
from datetime import date

@receiver(post_save, sender=Lease)
def create_initial_invoices_and_update_status(sender, instance: Lease, created, **kwargs):
    """
    Automation after Lease is created:
    1. Set Renter status active
    2. Set Unit status occupied
    3. Create initial invoices:
        - Security deposit (if any)
        - First month rent
    """
    if not created:
        return  # only run on new leases

    # 1️⃣ Update Renter status
    renter = instance.renter
    renter.status = "active"  # make sure you have a status field in Renter
    renter.save(update_fields=["status"])

    # 2️⃣ Update Unit status
    unit = instance.unit
    unit.status = "occupied"  # make sure Unit has a status field
    unit.save(update_fields=["status"])

    # 3️⃣ Create Security Deposit Invoice
    due_date = date(date.today().year, date.today().month, 10)
    if instance.security_deposit > 0:
        Invoice.objects.create(
            lease=instance,
            invoice_type="security_deposit",
            amount=instance.security_deposit,
            due_date=due_date,
            status="unpaid",
            description=f"Security deposit for lease {instance.id}"
        )

    # 4️⃣ Create First Month Rent Invoice
    due_date = date(date.today().year, date.today().month, 10)
    invoice_month = instance.start_date.replace(day=1)  # ensure it's the first day of the start month

    Invoice.objects.create(
        lease=instance,
        invoice_type="rent",
        amount=instance.rent_amount,
        due_date=due_date,
        invoice_month=invoice_month,
        status="unpaid",
        description=f"Rent for {instance.start_date.strftime('%B %Y')}"
    )
