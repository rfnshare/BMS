# notifications/api/serializers.py

from rest_framework import serializers
from notifications.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    invoice_id = serializers.IntegerField(source="invoice.id", read_only=True)
    renter_name = serializers.CharField(source="renter.name", read_only=True)
    sent_by_name = serializers.CharField(source="sent_by.username", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "channel",
            "renter_name",
            "invoice_id",
            "recipient",
            "subject",
            "message",
            "status",
            "sent_by",
            "sent_by_name",
            "sent_at",
            "error_message",
        ]
        read_only_fields = [
            "id",
            "sent_at",
            "status",
            "error_message",
            "sent_by_name",
            "renter_name",
            "invoice_id",
        ]
