from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    # Flattened fields for easy UI display
    renter_name = serializers.CharField(source="lease.renter.full_name", read_only=True)
    unit_name = serializers.CharField(source="lease.unit.name", read_only=True)
    unit_number = serializers.CharField(source="lease.unit.unit_number", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id", "lease", "renter_name", "unit_name", "unit_number",
            "title", "description", "status", "priority", 
            "attachment", "resolved_at", 
            "created_by", "created_by_name", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)