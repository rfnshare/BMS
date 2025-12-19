from django.db import models
from common.models import BaseAuditModel
from leases.models import Lease
from accounts.models import User
from common.utils.storage import complaint_attachment_upload_path


class Complaint(BaseAuditModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    lease = models.ForeignKey(
        Lease,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM
    )

    attachment = models.FileField(
        upload_to=complaint_attachment_upload_path,
        blank=True,
        null=True
    )

    resolved_at = models.DateTimeField(null=True, blank=True)

    # Who submitted it? (Could be Renter or Admin)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="submitted_complaints"
    )

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title}"