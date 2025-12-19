# payments/models.py
from django.db import models
from common.models import BaseAuditModel
from leases.models import Lease
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
        Lease, related_name="payments", on_delete=models.CASCADE, blank=True, null=True
    )
    payment_date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="cash")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def create(self, validated_data):
        invoice = validated_data.get('invoice')
        lease = validated_data.get('lease')

        # 🔥 Logic: If paying an invoice, the lease is implicitly the invoice's lease
        if invoice and not lease:
            validated_data['lease'] = invoice.lease

        return super().create(validated_data)

    def __str__(self):
        target = self.invoice.id if self.invoice else f"Lease {self.lease.id}"
        return f"Payment {self.id} | {target} | {self.amount}"
