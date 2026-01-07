# reports/serializers.py
from rest_framework import serializers
from invoices.models import Invoice
from buildings.models import Unit
from renters.models import Renter

class FinancialSummarySerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_invoiced = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_collected = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_outstanding = serializers.DecimalField(max_digits=14, decimal_places=2)
    invoice_count = serializers.IntegerField()
    payment_count = serializers.IntegerField()
    invoice_status_counts = serializers.ListField()

class InvoiceListSerializer(serializers.ModelSerializer):
    renter = serializers.CharField(source="lease.renter.full_name", read_only=True)
    unit = serializers.CharField(source="lease.unit.name", read_only=True)
    class Meta:
        model = Invoice
        fields = ["id", "invoice_number", "invoice_type", "invoice_month", "invoice_date", "due_date", "amount", "paid_amount", "balance_due", "status", "renter", "unit"]

class OccupancySummarySerializer(serializers.Serializer):
    total_units = serializers.IntegerField()
    occupied_units = serializers.IntegerField()
    vacant_units = serializers.IntegerField()
    maintenance_units = serializers.IntegerField()
    occupancy_rate = serializers.FloatField()
    active_leases = serializers.IntegerField()
    leases_ending_in_period = serializers.IntegerField()

class UnitListSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source="floor.name", read_only=True)
    class Meta:
        model = Unit
        fields = ["id", "name", "floor_name", "unit_type", "status", "monthly_rent"]

class RenterCollectionRowSerializer(serializers.Serializer):
    renter_id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField(source="user.email", allow_null=True)
    phone_number = serializers.CharField()
    total_invoiced = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_due = serializers.DecimalField(max_digits=14, decimal_places=2)
