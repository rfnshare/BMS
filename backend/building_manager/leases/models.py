from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils.timezone import now

from buildings.models import Unit
from common.models import BaseAuditModel
from common.utils.storage import lease_document_upload_path
from renters.models import Renter


class Lease(BaseAuditModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("terminated", "Terminated"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    DEPOSIT_STATUS_CHOICES = [
        ("pending", "Pending"),  # Not yet paid
        ("paid", "Paid"),  # Security deposit fully paid
        ("adjusted", "Adjusted"),  # Partially or fully used to cover dues
        ("refunded", "Refunded"),  # Deposit returned to renter
    ]

    # Core Relationships
    renter = models.ForeignKey(Renter, on_delete=models.PROTECT, related_name="leases")
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="leases")

    # Lease Period
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    termination_date = models.DateField(blank=True, null=True)

    # Financials
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_status = models.CharField(max_length=20, choices=DEPOSIT_STATUS_CHOICES, default="pending")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Move-in Checklist
    electricity_card_given = models.BooleanField(default=False)
    gas_card_given = models.BooleanField(default=False)
    main_gate_key_given = models.BooleanField(default=False)
    pocket_gate_key_given = models.BooleanField(default=False)
    agreement_paper_given = models.BooleanField(default=False)
    police_verification_done = models.BooleanField(default=False)
    other_docs_given = models.JSONField(blank=True, null=True)

    # File uploads
    agreement_file = models.FileField(upload_to=lease_document_upload_path, blank=True, null=True)
    police_verification_file = models.FileField(upload_to=lease_document_upload_path, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-start_date", "-id"]  # Optional: latest lease first

    def clean(self):
        """Custom validation for dates and unique active lease per unit."""
        # Date logic
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date.")
        if self.termination_date and self.start_date and self.termination_date < self.start_date:
            raise ValidationError("Termination date cannot be before start date.")

        # Only one active lease per unit
        if self.status == "active":
            qs = Lease.objects.filter(unit=self.unit, status="active").exclude(id=self.id)
            if qs.exists():
                raise ValidationError(f"Unit {self.unit.name} already has an active lease.")


    @property
    def current_balance(self):
        """
        Calculate current balance:
        - Active lease: sum all invoices except security deposit
        - Terminated lease: use final settlement invoice only
        """
        if self.status == "terminated":
            final_invoice = self.invoices.filter(is_final=True).first()
            if final_invoice:
                return max(final_invoice.amount - final_invoice.paid_amount, Decimal("0.00"))
            return Decimal("0.00")  # fallback if no final invoice

        # Active lease: sum unpaid/partial invoices excluding security deposit
        invoices_qs = self.invoices.filter(status__in=["unpaid", "partially_paid", "paid"]) \
            .exclude(invoice_type="security_deposit")
        total_balance = sum(max(inv.amount - inv.paid_amount, Decimal("0.00")) for inv in invoices_qs)
        return total_balance


class LeaseRentHistory(BaseAuditModel):
    lease = models.ForeignKey(Lease, related_name="rent_history", on_delete=models.CASCADE)
    old_rent = models.DecimalField(max_digits=12, decimal_places=2)
    new_rent = models.DecimalField(max_digits=12, decimal_places=2)
    effective_date = models.DateField(default=now)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Lease {self.lease.id} Rent Change {self.old_rent} → {self.new_rent}"
