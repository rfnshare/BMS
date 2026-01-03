from decimal import Decimal
from datetime import date

from django.db import transaction, models
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.pagination import CustomPagination
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from invoices.models import Invoice
from .models import Lease, LeaseRentHistory, RentType
from .serializers import LeaseSerializer, LeaseRentHistorySerializer, RentTypeSerializer


@extend_schema(tags=["Leases"])
class LeaseViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = Lease.objects.all().select_related("renter", "unit")
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "deposit_status", "renter", "unit"]
    search_fields = ["renter__full_name", "unit__name"]
    ordering_fields = ["start_date", "end_date", "created_at"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        """
        Save lease with nested lease_rents (if provided)
        """
        lease = serializer.save()
        return lease  # Signal handles invoice creation

    @action(detail=True, methods=["post"], url_path="terminate")
    def terminate_lease(self, request, pk=None):
        """
        Terminate lease:
        - Update lease, renter, unit status
        - Create final adjustment/refund invoices
        """
        with transaction.atomic():
            lease = self.get_object()

            if lease.status != "active":
                return Response(
                    {"status": "error", "message": "Only active leases can be terminated."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Terminate lease
            lease.status = "terminated"
            lease.termination_date = timezone.now().date()
            lease.save(update_fields=["status", "termination_date"])

            # Update unit
            lease.unit.status = "vacant"
            lease.unit.save(update_fields=["status"])

            # Update renter if no other active leases
            renter = lease.renter
            if not renter.leases.filter(status="active").exists():
                renter.status = renter.Status.FORMER
                renter.save(update_fields=["status"])

            # --- Financial calculations ---
            # Rent invoices (exclude security deposit)
            rent_invoices = lease.invoices.filter(
                status__in=["unpaid", "partially_paid"]
            ).exclude(invoice_type="security_deposit")

            total_rent_due = rent_invoices.aggregate(
                total=models.Sum(models.F("amount") - models.F("paid_amount"))
            )["total"] or Decimal("0.00")

            # Paid security deposit
            paid_deposit = lease.invoices.filter(
                invoice_type="security_deposit"
            ).aggregate(total=models.Sum("paid_amount"))["total"] or Decimal("0.00")

            total_rent_due = max(total_rent_due - paid_deposit, Decimal("0.00"))

            created_invoices = []

            due_date = timezone.now().date().replace(day=10)

            if total_rent_due > 0:
                # Adjustment invoice for outstanding dues
                invoice = Invoice.objects.create(
                    lease=lease,
                    invoice_type="adjustment",
                    amount=total_rent_due,
                    due_date=due_date,
                    status="unpaid",
                    description=f"Final settlement for Lease {lease.id} after applying security deposit",
                    is_final=True
                )
                created_invoices.append(invoice)
                lease.deposit_status = "adjusted"
            elif paid_deposit > 0:
                # Refund excess deposit
                refund_amount = paid_deposit - sum(inv.amount - inv.paid_amount for inv in rent_invoices)
                if refund_amount > 0:
                    refund_invoice = Invoice.objects.create(
                        lease=lease,
                        invoice_type="adjustment",
                        amount=refund_amount,
                        due_date=due_date,
                        status="unpaid",
                        description=f"Refund of excess security deposit for Lease {lease.id}",
                        is_final=True
                    )
                    created_invoices.append(refund_invoice)
                    lease.deposit_status = "refunded"
                else:
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
class LeaseRentHistoryViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = LeaseRentHistory.objects.all()
    serializer_class = LeaseRentHistorySerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

@extend_schema(tags=["Rent Type Configuration"])
class RentTypeViewSet(viewsets.ModelViewSet):
    queryset = RentType.objects.all()
    serializer_class = RentTypeSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
