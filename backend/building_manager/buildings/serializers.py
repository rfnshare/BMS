# building_manager/buildings/serializers.py
from rest_framework import serializers
from .models import Floor, Unit, UnitDocument


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = "__all__"

class UnitDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitDocument
        fields = ["id", "doc_type", "file", "uploaded_at"]

class UnitSerializer(serializers.ModelSerializer):
    documents = UnitDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = [
            "id", "floor", "name", "unit_type", "status",
            "monthly_rent", "remarks", "security_deposit",
            "prepaid_electricity_meter_no", "prepaid_electricity_old_meter_no", "prepaid_electricity_customer_no",
            "prepaid_gas_meter_customer_code", "prepaid_gas_meter_prepaid_code",
            "prepaid_gas_meter_no", "prepaid_gas_card_no",
            "documents",
            "created_at", "updated_at"
        ]