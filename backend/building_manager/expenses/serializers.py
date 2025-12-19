from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    # 🔥 FIX: Look up the renter name via the linked lease
    renter_name = serializers.CharField(source="lease.renter.full_name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "lease",  # 🔥 Changed from 'renter' to 'lease'
            "renter_name",
            "title",
            "description",
            "amount",
            "category",
            "date",
            "is_renter_related",
            "attachment",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_renter_related",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        # 1. Get the user from the request context
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user

        # 2. Auto-calculate is_renter_related based on presence of LEASE
        validated_data["is_renter_related"] = bool(validated_data.get("lease"))

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # 1. Update is_renter_related only if 'lease' is present in the update data
        if "lease" in validated_data:
            validated_data["is_renter_related"] = bool(validated_data.get("lease"))

        return super().update(instance, validated_data)