from decimal import Decimal

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
            # Track existing lease_rent IDs
            existing_ids = {lr.id for lr in instance.lease_rents.all()}
            incoming_ids = set()

            total_rent = Decimal("0.00")
            for rent_data in lease_rents_data:
                rent_id = rent_data.get("id", None)
                if rent_id:
                    # Update existing
                    lease_rent = LeaseRent.objects.get(id=rent_id, lease=instance)
                    lease_rent.rent_type = rent_data.get("rent_type", lease_rent.rent_type)
                    lease_rent.amount = rent_data.get("amount", lease_rent.amount)
                    lease_rent.save()
                    incoming_ids.add(rent_id)
                    total_rent += lease_rent.amount
                else:
                    # Create new
                    rent = LeaseRent.objects.create(lease=instance, **rent_data)
                    total_rent += rent.amount

            # Delete lease_rents not in incoming data
            to_delete = existing_ids - incoming_ids
            if to_delete:
                LeaseRent.objects.filter(id__in=to_delete).delete()

            # Update rent_amount
            instance.rent_amount = total_rent
            instance.save(update_fields=["rent_amount"])

        return instance



