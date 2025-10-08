# notifications/utils.py
from notifications.models import Notification
import random


class NotificationService:
    """
    Mocked notification service.
    Future-proof: dynamically reads model choices.
    In Phase 2, replace with real Email/WhatsApp send logic.
    """

    @staticmethod
    def send(notification_type, renter, channel, subject, message, invoice=None, sent_by=None):
        # Dynamically pull valid choices from model
        valid_channels = dict(Notification.CHANNEL_CHOICES).keys()
        valid_types = dict(Notification.TYPE_CHOICES).keys()

        # Validate inputs
        if notification_type not in valid_types:
            raise ValueError(f"Invalid notification_type '{notification_type}'. Must be one of {list(valid_types)}.")
        if channel not in valid_channels:
            raise ValueError(f"Invalid channel '{channel}'. Must be one of {list(valid_channels)}.")

        # Determine recipient
        recipient = renter.email if channel == "email" else renter.phone_number
        if not recipient:
            raise ValueError(f"Renter has no valid recipient for channel '{channel}'.")

        # Base error/log message
        error_message = f"Simulated send to {recipient} via {channel}"

        # Create initial Notification record
        notification = Notification.objects.create(
            notification_type=notification_type,
            renter=renter,
            invoice=invoice,
            channel=channel,
            recipient=recipient,
            subject=subject,
            message=message,
            sent_by=sent_by,
            error_message=error_message,
            status="pending",
        )

        # Simulate actual sending (mock)
        success = random.choice([True, True, True, False])  # ~75% success rate

        notification.status = "sent" if success else "failed"
        notification.error_message += " — Success" if success else " — Failed (simulated error)"
        notification.save()

        return notification
