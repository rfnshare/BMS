from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.pagination import CustomPagination
from invoices.models import Invoice
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from .models import Lease, LeaseRentHistory
from .serializers import LeaseSerializer, LeaseRentHistorySerializer


@extend_schema(tags=["Leases"])
class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.all().select_related("renter", "unit")
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "deposit_status", "renter", "unit"]
    search_fields = ["renter__full_name", "unit__name"]
    ordering_fields = ["start_date", "end_date", "created_at"]
    ordering = ["-created_at"]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        lease = serializer.save()
        # future: auto-generate first invoice here if needed
        return lease

    @action(detail=True, methods=["post"], url_path="terminate")
    def terminate_lease(self, request, pk=None):
        with transaction.atomic():
            lease = self.get_object()

            if lease.status != "active":
                return Response({
                    "status": "error",
                    "message": "Only active leases can be terminated."
                }, status=status.HTTP_400_BAD_REQUEST)

            lease.status = "terminated"
            lease.termination_date = timezone.now().date()
            lease.save(update_fields=["status", "termination_date"])

            # Update unit status
            lease.unit.status = "vacant"
            lease.unit.save(update_fields=["status"])

            # Update renter status if no active leases
            renter = lease.renter
            if not renter.leases.filter(status="active").exists():
                renter.status = renter.Status.FORMER
                renter.save(update_fields=["status"])

            # Financial calculations
            current_balance = Decimal(lease.current_balance)
            security_deposit = Decimal(lease.security_deposit)
            deposit_status = lease.deposit_status

            created_invoices = []

            # Handle security deposit if partially or fully paid
            if deposit_status in ["paid", "pending"] and security_deposit > 0:
                # Calculate remaining deposit
                paid_deposit_amount = sum(
                    p.amount for inv in lease.invoices.filter(invoice_type="security_deposit") for p in
                    inv.payments.all()
                )
                remaining_deposit = max(security_deposit - paid_deposit_amount, Decimal("0.00"))

                # Case 1: Deposit < balance → use deposit to offset
                if remaining_deposit < current_balance:
                    if current_balance - remaining_deposit > 0:
                        final_invoice = Invoice.objects.create(
                            lease=lease,
                            invoice_type="adjustment",
                            amount=current_balance - remaining_deposit,
                            due_date=timezone.now().date(),
                            status="unpaid",
                            description=f"Final settlement after applying security deposit for Lease {lease.id}"
                        )
                        created_invoices.append(final_invoice)
                    lease.deposit_status = "adjusted"

                # Case 2: Deposit >= balance → refund remaining deposit if any
                elif remaining_deposit >= current_balance:
                    refund_amount = remaining_deposit - current_balance
                    if refund_amount > 0:
                        refund_invoice = Invoice.objects.create(
                            lease=lease,
                            invoice_type="adjustment",
                            amount=refund_amount,
                            due_date=timezone.now().date(),
                            status="unpaid",
                            description=f"Refund of security deposit for Lease {lease.id}"
                        )
                        created_invoices.append(refund_invoice)
                    lease.deposit_status = "refunded" if refund_amount > 0 else "adjusted"

                # Always create unpaid invoice for remaining deposit if partially paid
                if deposit_status == "partially_paid" and remaining_deposit > 0:
                    remaining_deposit_invoice = Invoice.objects.create(
                        lease=lease,
                        invoice_type="security_deposit",
                        amount=remaining_deposit,
                        due_date=timezone.now().date(),
                        status="unpaid",
                        description=f"Remaining security deposit for Lease {lease.id}"
                    )
                    created_invoices.append(remaining_deposit_invoice)

            # No security deposit or unpaid → just generate final invoice if balance exists
            elif current_balance > 0:
                final_invoice = Invoice.objects.create(
                    lease=lease,
                    invoice_type="adjustment",
                    amount=current_balance,
                    due_date=timezone.now().date(),
                    status="unpaid",
                    description=f"Final settlement for Lease {lease.id}"
                )
                created_invoices.append(final_invoice)
                lease.deposit_status = "adjusted"

            lease.save(update_fields=["deposit_status"])

            return Response({
                "status": "success",
                "message": "Lease terminated successfully.",
                "lease_id": lease.id,
                "created_invoices": [
                    {
                        "id": inv.id,
                        "type": inv.invoice_type,
                        "amount": str(inv.amount),
                        "status": inv.status,
                    } for inv in created_invoices
                ]
            }, status=status.HTTP_200_OK)


@extend_schema(tags=["Lease Rent History"])
class LeaseRentHistoryViewSet(viewsets.ModelViewSet):
    queryset = LeaseRentHistory.objects.all()
    serializer_class = LeaseRentHistorySerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
