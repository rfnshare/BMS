# invoices/serializers.py
from rest_framework import serializers
from .models import Invoice
from django.db.models import Q

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id", "lease", "invoice_type", "invoice_month", "invoice_date",
            "due_date", "amount", "paid_amount", "status", "description",
            "reference_number", "invoice_number", "is_final", "invoice_pdf",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id","invoice_number","invoice_pdf","created_at","updated_at","paid_amount"]

    def validate(self, data):
        invoice_type = data.get("invoice_type", getattr(self.instance, "invoice_type", None))
        lease = data.get("lease", getattr(self.instance, "lease", None))
        invoice_month = data.get("invoice_month", getattr(self.instance, "invoice_month", None))

        # For rent invoice require invoice_month
        if invoice_type == "rent" and not invoice_month:
            raise serializers.ValidationError({"invoice_month": "invoice_month is required for rent invoices (use YYYY-MM-01)."})

        # Prevent duplicate rent invoice for same month+lease
        if invoice_type == "rent" and lease and invoice_month:
            qs = Invoice.objects.filter(lease=lease, invoice_type="rent", invoice_month=invoice_month)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"invoice_month": "A rent invoice for this lease and month already exists."})

        return data
