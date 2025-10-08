# notifications/models.py
from django.db import models
from django.utils import timezone
from accounts.models import User
from common.models import BaseAuditModel
from invoices.models import Invoice
from renters.models import Renter


class Notification(BaseAuditModel):
    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("whatsapp", "WhatsApp"),
    ]
    TYPE_CHOICES = [
        ("invoice_created", "Invoice Created"),
        ("rent_reminder", "Rent Reminder"),
        ("overdue_notice", "Overdue Notice"),
    ]

    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    renter = models.ForeignKey(Renter, on_delete=models.SET_NULL, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)
    recipient = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("sent", "Sent"), ("failed", "Failed")],
        default="pending",
    )
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(default=timezone.now)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.notification_type} → {self.recipient} ({self.channel})"
