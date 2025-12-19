from decimal import Decimal
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
        """
        Validates that payments are financially sound and properly linked.
        """
        invoice = data.get("invoice")
        lease = data.get("lease")
        amount = data.get("amount")

        # 1. Ensure at least one link exists
        if not invoice and not lease:
            raise serializers.ValidationError("Either 'invoice' or 'lease' must be provided.")

        # 2. Strict Linkage: Frontend should only send one to keep data clean
        if invoice and lease:
            raise serializers.ValidationError("Provide only one: 'invoice' OR 'lease', not both.")

        # 3. Currency Check
        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")

        # 4. Overpayment Check
        if invoice:
            remaining_balance = invoice.amount - invoice.paid_amount
            if amount > remaining_balance:
                raise serializers.ValidationError(
                    f"Payment exceeds invoice balance. Remaining: ৳{remaining_balance}"
                )

        return data

    def create(self, validated_data):
        """
        🔥 THE FIX: If an invoice is provided, automatically extract the lease 
        from that invoice and save it to the Payment record.
        """
        invoice = validated_data.get('invoice')
        lease = validated_data.get('lease')

        # If paying an invoice, the lease is implicitly the invoice's lease
        if invoice and not lease:
            validated_data['lease'] = invoice.lease

        return super().create(validated_data)


class BulkPaymentSerializer(serializers.Serializer):
    lease_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES)
    transaction_reference = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        lease_id = data.get("lease_id")
        amount = data.get("amount")

        try:
            lease = Lease.objects.get(id=lease_id)
        except Lease.DoesNotExist:
            raise serializers.ValidationError("Lease not found.")

        # Fetch eligible invoices (Unpaid and standard types)
        invoices = lease.invoices.exclude(
            status="paid"
        ).exclude(
            invoice_type__in=["security_deposit", "adjustment"]
        ).order_by("invoice_date", "id")

        # Total debt check
        total_outstanding = sum(
            (inv.amount - inv.paid_amount for inv in invoices),
            Decimal("0.00")
        )

        if amount > total_outstanding:
            raise serializers.ValidationError(
                f"Payment exceeds total outstanding balance (৳{total_outstanding})."
            )

        return data

    def create(self, validated_data):
        """
        Calls the service layer to apply bulk amounts across multiple invoices.
        """
        lease = Lease.objects.get(id=validated_data["lease_id"])

        # Ensure apply_bulk_payment handles the 'lease' field inside its logic
        payments, allocation = apply_bulk_payment(
            lease=lease,
            amount=validated_data["amount"],
            method=validated_data.get("method", "cash"),
            transaction_reference=validated_data.get("transaction_reference"),
            notes=validated_data.get("notes"),
        )

        self._allocation = allocation
        return payments