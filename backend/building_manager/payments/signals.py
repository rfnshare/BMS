from django.db.models.signals import post_save
from django.dispatch import receiver

from payments.models import Payment


@receiver(post_save, sender=Payment)
def update_invoice_and_lease(sender, instance: Payment, created, **kwargs):
    if not created:
        return

    payment_amount = instance.amount
    lease = instance.invoice.lease

    invoices = lease.invoices.filter(status__in=["unpaid", "partially_paid"]).order_by("invoice_date", "id")

    for inv in invoices:
        if payment_amount <= 0:
            break

        balance = inv.amount - inv.paid_amount

        if balance <= 0:
            continue  # Already fully paid

        if payment_amount >= balance:
            inv.paid_amount = inv.paid_amount + balance
            inv.status = "paid"
            payment_amount -= balance
        else:
            inv.paid_amount = inv.paid_amount + payment_amount
            inv.status = "partially_paid"
            payment_amount = 0

        inv.save(update_fields=["paid_amount", "status"])

    # Optional: update lease status if all invoices are paid
    all_invoices_paid = not lease.invoices.filter(status__in=["unpaid", "partially_paid"]).exists()
    if all_invoices_paid and lease.status == "active":
        lease.status = "completed"
        lease.save(update_fields=["status"])
