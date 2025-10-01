# building_manager/buildings/serializers.py
from rest_framework import serializers
from .models import Floor, Unit
from documents.serializers import UnitDocumentSerializer


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = "__all__"

class UnitSerializer(serializers.ModelSerializer):
    documents = UnitDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id', 'floor', 'name', 'unit_type', 'status',
            'monthly_rent', 'security_deposit', 'remarks',
            'prepaid_electricity_meter_no', 'prepaid_electricity_old_meter_no',
            'prepaid_electricity_customer_no', 'prepaid_gas_meter_customer_code',
            'prepaid_gas_meter_prepaid_code', 'prepaid_gas_meter_no',
            'prepaid_gas_card_no', 'documents'
        ]