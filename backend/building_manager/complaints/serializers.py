# complaints/serializers.py
from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    renter_name = serializers.CharField(source="renter.full_name", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "renter",
            "renter_name",
            "title",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "renter_name", "created_at", "updated_at", "status"]
