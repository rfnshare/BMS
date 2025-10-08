# scheduling/models.py
from django.db import models

from common.models import BaseAuditModel


class TaskLog(BaseAuditModel):
    TASK_CHOICES = [
        ("GENERATE_INVOICES", "Generate Invoices"),
        ("LEASE_REMINDER", "Lease Reminder"),
        ("CUSTOM", "Custom Task"),
    ]

    task_name = models.CharField(max_length=255, choices=TASK_CHOICES)
    status = models.CharField(max_length=50, choices=[
        ("PENDING", "Pending"),
        ("STARTED", "Started"),
        ("SUCCESS", "Success"),
        ("FAILURE", "Failure"),
    ], default="PENDING")
    message = models.TextField(blank=True, null=True)
    executed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-executed_at"]

    def __str__(self):
        return f"{self.task_name} - {self.status}"
