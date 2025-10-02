from decimal import Decimal
from invoices.models import Invoice
from django.db import transaction
from django.utils.timezone import now

from payments.models import Payment


def apply_bulk_payment(lease, amount, method="cash", transaction_reference=None, notes=None):
    """
    Allocate a payment amount to all unpaid invoices of a lease (oldest first).
    Returns list of Payment objects created.
    """
    if amount <= 0:
        raise ValueError("Payment amount must be positive.")

    # Fetch unpaid or partially paid invoices
    invoices = Invoice.objects.filter(
        lease=lease,
    ).exclude(status="paid").order_by("due_date", "id")

    payments_created = []
    remaining_amount = Decimal(amount)

    with transaction.atomic():
        for invoice in invoices:
            invoice_balance = invoice.amount - invoice.paid_amount

            if remaining_amount <= 0:
                break

            # Determine how much to pay on this invoice
            pay_amount = min(invoice_balance, remaining_amount)

            # Create payment
            payment = Payment.objects.create(
                invoice=invoice,
                amount=pay_amount,
                method=method,
                transaction_reference=transaction_reference,
                notes=notes,
            )
            payments_created.append(payment)

            # Update invoice paid_amount and status
            invoice.paid_amount += pay_amount
            if invoice.paid_amount >= invoice.amount:
                invoice.status = "paid"
            else:
                invoice.status = "partially_paid"
            invoice.save(update_fields=["paid_amount", "status"])

            # Subtract paid amount from remaining
            remaining_amount -= pay_amount

    return payments_created
