# payments/models.py
from django.db import models
from django.db import transaction
from common.models import BaseAuditModel
from invoices.models import Invoice

class Payment(BaseAuditModel):
    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank", "Bank Transfer"),
        ("card", "Credit/Debit Card"),
        ("mobile", "Mobile Payment"),
        ("adjustment", "Deposit Adjustment"),
    ]

    invoice = models.ForeignKey(
        Invoice, related_name="payments", on_delete=models.CASCADE, blank=True, null=True
    )
    lease = models.ForeignKey(
        "leases.Lease", related_name="payments", on_delete=models.CASCADE, blank=True, null=True
    )
    payment_date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="cash")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        target = self.invoice.id if self.invoice else f"Lease {self.lease.id}"
        return f"Payment {self.id} | {target} | {self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # Single invoice payment
            if self.invoice:
                self._update_invoice(self.invoice, self.amount)
            # Bulk payment for lease
            elif self.lease:
                self._allocate_bulk_payment()

    def _update_invoice(self, invoice, payment_amount):
        invoice.paid_amount += payment_amount
        # Update status
        if invoice.paid_amount >= invoice.amount:
            invoice.status = "paid"
        elif 0 < invoice.paid_amount < invoice.amount:
            invoice.status = "partially_paid"
        invoice.save(update_fields=["paid_amount", "status"])

    def _allocate_bulk_payment(self):
        """
        Distribute payment across unpaid invoices (oldest first).
        """
        remaining_amount = self.amount
        unpaid_invoices = self.lease.invoices.filter(status__in=["draft", "unpaid", "partially_paid"]).order_by("issue_date", "id")

        with transaction.atomic():
            for invoice in unpaid_invoices:
                if remaining_amount <= 0:
                    break

                invoice_balance = invoice.amount - invoice.paid_amount
                allocate_amount = min(remaining_amount, invoice_balance)

                self._update_invoice(invoice, allocate_amount)
                remaining_amount -= allocate_amount
