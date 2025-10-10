from django.db import models
from common.models import BaseAuditModel
from renters.models import Renter
from accounts.models import User
from common.utils.storage import expense_attachment_upload_path


class Expense(BaseAuditModel):
    class Category(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        UTILITY = "utility", "Utility"
        REPAIR = "repair", "Repair"
        OTHER = "other", "Other"

    renter = models.ForeignKey(
        Renter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
        help_text="Linked renter if this expense is renter-specific."
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
    is_renter_related = models.BooleanField(default=False)
    attachment = models.FileField(
        upload_to=expense_attachment_upload_path,
        blank=True,
        null=True,
        help_text="Optional receipt or supporting document."
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_expenses"
    )

    def save(self, *args, **kwargs):
        self.is_renter_related = bool(self.renter)
        super().save(*args, **kwargs)

    def __str__(self):
        base = f"{self.title} - {self.amount}"
        return f"{base} (Renter: {self.renter.full_name})" if self.renter else base
