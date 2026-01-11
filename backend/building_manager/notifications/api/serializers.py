# notifications/api/serializers.py

from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    # Expanded human-readable fields
    invoice_id = serializers.IntegerField(source="invoice.id", read_only=True)
    invoice_number = serializers.CharField(source="invoice.invoice_number", read_only=True)
    renter_name = serializers.CharField(source="renter.full_name", read_only=True)
    sent_by_name = serializers.CharField(source="sent_by.username", read_only=True)

    # Traceability: Showing the task name alongside the ID
    task_log_name = serializers.CharField(source="task_log.task_name", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "task_log",  # The ID
            "task_log_name",  # e.g., "SIGNAL_INVOICE_NOTIFY"
            "notification_type",
            "channel",
            "renter_name",
            "invoice_id",
            "invoice_number",
            "recipient",
            "subject",
            "message",
            "status",
            "sent_by",
            "sent_by_name",
            "sent_at",
            "error_message",
        ]
        read_only_fields = fields  # Usually, notifications are read-only records of history