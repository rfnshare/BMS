from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from common.models import BaseAuditModel
from renters.models import Renter
from buildings.models import Unit
from common.utils.storage import lease_document_upload_path


class Lease(BaseAuditModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("terminated", "Terminated"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    DEPOSIT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("refunded", "Refunded"),
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

    agreement_file = models.FileField(upload_to=lease_document_upload_path, blank=True, null=True)
    police_verification_file = models.FileField(upload_to=lease_document_upload_path, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["unit"],
                condition=models.Q(status="active"),
                name="unique_active_lease_per_unit"
            )
        ]

    def clean(self):
        """Ensure logical dates"""
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date.")
        if self.termination_date and self.start_date and self.termination_date < self.start_date:
            raise ValidationError("Termination date cannot be before start date.")

    def __str__(self):
        return f"Lease {self.id} | {self.renter.full_name} | {self.unit.name} | {self.status}"


class LeaseRentHistory(BaseAuditModel):
    lease = models.ForeignKey(Lease, related_name="rent_history", on_delete=models.CASCADE)
    old_rent = models.DecimalField(max_digits=12, decimal_places=2)
    new_rent = models.DecimalField(max_digits=12, decimal_places=2)
    effective_date = models.DateField(default=now)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Lease {self.lease.id} Rent Change {self.old_rent} → {self.new_rent}"