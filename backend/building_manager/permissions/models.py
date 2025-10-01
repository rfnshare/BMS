from django.db import models
from django.conf import settings


class AppPermission(models.Model):
    ROLE_CHOICES = [
        ("staff", "Staff"),
        ("renter", "Renter"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    app_label = models.CharField(max_length=50)      # e.g. "buildings"
    model_name = models.CharField(max_length=50)     # e.g. "Unit", "Floor"

    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=True)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    assigned_to = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="custom_permissions",
        blank=True,
    )

    def __str__(self):
        return f"{self.role} - {self.app_label}.{self.model_name}"
