from decimal import Decimal
from invoices.models import Invoice
from django.db import transaction
from payments.models import Payment

def apply_bulk_payment(lease, amount, method="cash", transaction_reference=None, notes=None):
    """
    Allocate a payment amount to all unpaid/partially paid invoices of a lease (oldest first).
    Returns:
        - List of Payment objects created
        - List of allocation details per invoice: {invoice_id, amount_applied, new_status}
    """
    if amount <= 0:
        raise ValueError("Payment amount must be positive.")

    from django.db.models import Q

    invoices = Invoice.objects.filter(
        lease=lease
    ).exclude(
        Q(status="paid") | Q(invoice_type__in=["security_deposit", "adjustment"])
    ).order_by("invoice_date", "id")
    # chronological order

    payments_created = []
    allocation = []
    remaining_amount = Decimal(amount)

    with transaction.atomic():
        for invoice in invoices:
            if remaining_amount <= 0:
                break

            invoice_balance = invoice.amount - invoice.paid_amount
            if invoice_balance <= 0:
                continue

            pay_amount = min(invoice_balance, remaining_amount)

            payment = Payment.objects.create(
                invoice=invoice,
                lease=lease,
                amount=pay_amount,
                method=method,
                transaction_reference=transaction_reference,
                notes=notes or "",
            )
            payments_created.append(payment)

            # Update invoice paid_amount and status
            invoice.paid_amount += pay_amount
            if invoice.paid_amount >= invoice.amount:
                invoice.status = "paid"
            else:
                invoice.status = "partially_paid"
            invoice.save(update_fields=["paid_amount", "status"])

            # Update lease deposit status if security deposit invoice fully paid
            if invoice.invoice_type == "security_deposit" and lease.deposit_status != "paid":
                lease.deposit_status = "paid"
                lease.save(update_fields=["deposit_status"])

            allocation.append({
                "invoice_id": invoice.id,
                "amount_applied": str(pay_amount),
                "status": invoice.status
            })

            remaining_amount -= pay_amount

    return payments_created, allocation
