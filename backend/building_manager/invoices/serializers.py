from rest_framework import serializers
from invoices.models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id",
            "lease",
            "invoice_number",
            "invoice_date",
            "due_date",
            "amount",
            "paid_amount",
            "status",
            "description",
            "reference_number",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "invoice_number",
            "invoice_date",
            "created_at",
            "updated_at"
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Invoice amount must be greater than zero.")
        return value
