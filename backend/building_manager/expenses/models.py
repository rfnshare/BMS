from django.db import models
from common.models import BaseAuditModel
from leases.models import Lease  # 🔥 Changed from Renter to Lease
from accounts.models import User
from common.utils.storage import expense_attachment_upload_path


class Expense(BaseAuditModel):
    class Category(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        UTILITY = "utility", "Utility"
        REPAIR = "repair", "Repair"
        OTHER = "other", "Other"

    # 🔥 LINK TO LEASE instead of Renter
    lease = models.ForeignKey(
        Lease,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
        help_text="Linked lease if this expense is tenant-specific (e.g. damages)."
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.OTHER
    )
    date = models.DateField()

    # Optional: You can keep this or derive it from 'if self.lease'
    is_renter_related = models.BooleanField(default=False)

    attachment = models.FileField(
        upload_to=expense_attachment_upload_path,
        blank=True,
        null=True
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_expenses"
    )

    def save(self, *args, **kwargs):
        self.is_renter_related = bool(self.lease)
        super().save(*args, **kwargs)

    def __str__(self):
        base = f"{self.title} - {self.amount}"
        return f"{base} (Lease: {self.lease})" if self.lease else base