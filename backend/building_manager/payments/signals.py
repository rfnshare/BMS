from django.db.models.signals import post_save
from django.dispatch import receiver
from payments.models import Payment
from leases.models import Lease
from decimal import Decimal

@receiver(post_save, sender=Payment)
def update_invoice_and_lease(sender, instance: Payment, created, **kwargs):
    """
    Update invoice(s) based on payment.
    - Single-invoice payment: only update that invoice.
    - Bulk payment for lease: allocate to unpaid/partial invoices in date order.
    - Security deposit invoices are excluded from bulk allocation.
    """
    if not created:
        return

    payment_amount = Decimal(instance.amount)
    lease: Lease = instance.lease if instance.lease else instance.invoice.lease

    # -------------------------
    # Single-invoice payment
    # -------------------------
    if instance.invoice_id:
        inv = instance.invoice

        balance = inv.amount - inv.paid_amount
        applied = min(balance, payment_amount)
        inv.paid_amount += applied
        payment_amount -= applied

        # Update status
        inv.status = "paid" if inv.paid_amount >= inv.amount else "partially_paid"
        inv.save(update_fields=["paid_amount", "status"])

        # Update deposit_status only for security deposit invoices
        if inv.invoice_type == "security_deposit":
            if inv.status == "paid" and lease.deposit_status != "paid":
                lease.deposit_status = "paid"
                lease.save(update_fields=["deposit_status"])
        return  # done for single invoice

    # -------------------------
    # Bulk payment (by lease)
    # -------------------------
    # Exclude security deposit & adjustment invoices from bulk allocation
    invoices = lease.invoices.filter(
        status__in=["unpaid", "partially_paid"]
    ).exclude(invoice_type__in=["security_deposit", "adjustment"]).order_by("invoice_date", "id")

    for inv in invoices:
        if payment_amount <= 0:
            break

        balance = inv.amount - inv.paid_amount
        if balance <= 0:
            continue

        applied = min(balance, payment_amount)
        inv.paid_amount += applied
        payment_amount -= applied

        inv.status = "paid" if inv.paid_amount >= inv.amount else "partially_paid"
        inv.save(update_fields=["paid_amount", "status"])

    # -------------------------
    # Optional: Update security deposit if paid individually
    # (Handled by single invoice payments only)
    # -------------------------ok