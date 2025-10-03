# payments/serializers.py
from rest_framework import serializers

from invoices.services import apply_bulk_payment
from .models import Payment
from invoices.models import Invoice
from leases.models import Lease

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "lease",
            "payment_date",
            "amount",
            "method",
            "transaction_reference",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "payment_date", "created_at"]

    def validate(self, data):
        invoice = data.get("invoice")
        lease = data.get("lease")
        amount = data.get("amount")

        if not invoice and not lease:
            raise serializers.ValidationError("Either 'invoice' or 'lease' must be provided.")

        if invoice and lease:
            raise serializers.ValidationError("Provide only one: 'invoice' OR 'lease', not both.")

        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")

        # single invoice payment check
        if invoice and amount > (invoice.amount - invoice.paid_amount):
            raise serializers.ValidationError("Payment exceeds invoice balance.")

        return data


class BulkPaymentSerializer(serializers.Serializer):
    lease_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES)
    transaction_reference = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        lease_id = data.get("lease_id")
        amount = data.get("amount")

        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")

        if not Lease.objects.filter(id=lease_id).exists():
            raise serializers.ValidationError("Lease not found.")

        return data

    def create(self, validated_data):
        lease = Lease.objects.get(id=validated_data["lease_id"])
        payments, allocation = apply_bulk_payment(
            lease=lease,
            amount=validated_data["amount"],
            method=validated_data.get("method", "cash"),
            transaction_reference=validated_data.get("transaction_reference"),
            notes=validated_data.get("notes"),
        )
        # Attach allocation info to the serializer instance for the view
        self._allocation = allocation
        return payments


