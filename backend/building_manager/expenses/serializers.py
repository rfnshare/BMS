from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    renter_name = serializers.CharField(source="renter.full_name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "renter",
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
        request = self.context.get("request")
        validated_data["created_by"] = request.user
        return super().create(validated_data)
