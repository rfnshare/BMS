from decimal import Decimal

from django.db import models
from rest_framework import serializers

from documents.serializers import LeaseDocumentSerializer
from .models import Lease, LeaseRentHistory, LeaseRent, RentType


class LeaseRentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseRentHistory
        fields = ["id", "old_rent", "new_rent", "effective_date", "remarks", "created_at"]

class LeaseRentSerializer(serializers.ModelSerializer):
    rent_type_name = serializers.CharField(source="rent_type.name", read_only=True)

    class Meta:
        model = LeaseRent
        fields = ["id", "rent_type", "rent_type_name", "amount"]

class RentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentType
        fields = '__all__'


class LeaseSerializer(serializers.ModelSerializer):
    documents = LeaseDocumentSerializer(many=True, read_only=True)
    rent_history = LeaseRentHistorySerializer(many=True, read_only=True)
    lease_rents = LeaseRentSerializer(many=True)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    rent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Lease
        fields = [
            "id", "renter", "unit", "start_date", "end_date", "termination_date",
            "rent_amount", "security_deposit", "deposit_status", "current_balance", "status",
            "lease_rents",
            "electricity_card_given", "gas_card_given", "main_gate_key_given",
            "pocket_gate_key_given", "agreement_paper_given", "police_verification_done",
            "other_docs_given", "remarks", "documents", "rent_history",
            "agreement_file", "police_verification_file",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "deposit_status", "rent_amount"]

    def create(self, validated_data):
        lease_rents_data = validated_data.pop("lease_rents", None)
        if not lease_rents_data:
            raise serializers.ValidationError({"lease_rents": "This field is required."})
        total_rent = sum(Decimal(rent_data["amount"]) for rent_data in lease_rents_data)
        validated_data["rent_amount"] = total_rent

        lease = Lease.objects.create(**validated_data)
        for rent_data in lease_rents_data:
            LeaseRent.objects.create(lease=lease, **rent_data)
        return lease

    def update(self, instance, validated_data):
        lease_rents_data = validated_data.pop("lease_rents", None)
        instance = super().update(instance, validated_data)

        if lease_rents_data is not None:
            for rent_data in lease_rents_data:
                rent_type = rent_data["rent_type"]
                amount = rent_data["amount"]

                # Update existing LeaseRent or create new
                LeaseRent.objects.update_or_create(
                    lease=instance,
                    rent_type_id=rent_type,
                    defaults={"amount": amount}
                )

            # Recalculate total rent_amount after updating lease_rents
            total_rent = instance.lease_rents.aggregate(
                total=models.Sum("amount")
            )["total"] or Decimal("0.00")
            instance.rent_amount = total_rent
            instance.save(update_fields=["rent_amount"])

        return instance




