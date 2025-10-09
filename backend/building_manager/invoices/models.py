from django.db import models
from django.db.models import Q
from django.utils import timezone

from common.models import BaseAuditModel
from common.utils.storage import invoice_pdf_upload_path
from leases.models import Lease


class Invoice(BaseAuditModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("unpaid", "Unpaid"),
        ("partially_paid", "Partially Paid"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    TYPE_CHOICES = [
        ("security_deposit", "Security Deposit"),
        ("rent", "Monthly Rent"),
        ("adjustment", "Adjustment / Refund"),
        ("other", "Other"),
    ]

    lease = models.ForeignKey(Lease, related_name="invoices", on_delete=models.CASCADE)

    invoice_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="rent")
    invoice_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    invoice_month = models.DateField(blank=True, null=True,
                                     help_text="Use first day of month: YYYY-MM-01 for rent invoices")
    invoice_pdf = models.FileField(upload_to=invoice_pdf_upload_path, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    description = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    is_final = models.BooleanField(default=False)

    class Meta:
        ordering = ["-invoice_date", "-id"]
        constraints = [
            # prevent duplicate rent invoice for same lease + month
            models.UniqueConstraint(
                fields=["lease", "invoice_month"],
                condition=Q(invoice_type="rent"),
                name="unique_rent_invoice_per_lease_month",
            )
        ]

    @property
    def balance_due(self):
        return max(self.amount - self.paid_amount, 0)

    def save(self, *args, **kwargs):
        if self.invoice_type == "rent" and not self.invoice_month:
            today = self.invoice_date or timezone.now().date()
            self.invoice_month = today.replace(day=1)

        is_new = self.pk is None

        # First save to get pk if new
        super().save(*args, **kwargs)

        # Generate invoice_number if missing (after pk exists)
        if not self.invoice_number:
            self.invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{self.pk}"
            super().save(update_fields=["invoice_number"])

    def __str__(self):
        return f"Invoice {self.invoice_number or self.id} | Lease {self.lease.id} | {self.invoice_type} | {self.status}"
