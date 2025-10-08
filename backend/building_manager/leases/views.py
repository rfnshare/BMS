from decimal import Decimal

from django.db import transaction, models
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date
from common.pagination import CustomPagination
from invoices.models import Invoice
from payments.models import Payment
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from .models import Lease, LeaseRentHistory
from .serializers import LeaseSerializer, LeaseRentHistorySerializer


@extend_schema(tags=["Leases"])
class LeaseViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = Lease.objects.all().select_related("renter", "unit")
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
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

            # Validate lease status
            if lease.status != "active":
                return Response({
                    "status": "error",
                    "message": "Only active leases can be terminated."
                }, status=400)

            # Terminate lease
            lease.status = "terminated"
            lease.termination_date = timezone.now().date()
            lease.save(update_fields=["status", "termination_date"])

            # Update unit
            lease.unit.status = "vacant"
            lease.unit.save(update_fields=["status"])

            # Update renter status if no other active leases
            renter = lease.renter
            if not renter.leases.filter(status="active").exists():
                renter.status = renter.Status.FORMER
                renter.save(update_fields=["status"])

            # --- Financial calculations ---

            # 1️⃣ Sum unpaid/partial rent invoices (exclude security deposit & adjustments)
            rent_invoices = lease.invoices.filter(
                status__in=["unpaid", "partially_paid"],
            ).exclude(invoice_type__in=["security_deposit", "adjustment"])

            total_rent_due = rent_invoices.aggregate(
                total=models.Sum(models.F("amount") - models.F("paid_amount"))
            )["total"] or Decimal("0.00")

            # 2️⃣ Paid security deposit
            paid_deposit_amount = Invoice.objects.filter(
                lease=lease,
                invoice_type="security_deposit"
            ).aggregate(total=models.Sum("paid_amount"))["total"] or Decimal("0.00")

            total_rent_due = max(total_rent_due - paid_deposit_amount, Decimal("0.00"))

            created_invoices = []

            # 3️⃣ Create consolidated adjustment invoice if tenant owes money
            due_date = date(date.today().year, date.today().month, 10)
            if total_rent_due > 0:
                invoice = Invoice.objects.create(
                    lease=lease,
                    invoice_type="adjustment",
                    amount=total_rent_due,
                    due_date=due_date,
                    status="unpaid",
                    description=f"Final settlement for Lease {lease.id} after applying security deposit",
                    is_final=True,
                )
                created_invoices.append(invoice)
                lease.deposit_status = "adjusted"

            # 4️⃣ Create refund invoice if deposit exceeds rent
            elif paid_deposit_amount > 0:
                refund_amount = paid_deposit_amount - sum(
                    inv.amount - inv.paid_amount for inv in rent_invoices
                )
                due_date = date(date.today().year, date.today().month, 10)
                if refund_amount > 0:
                    refund_invoice = Invoice.objects.create(
                        lease=lease,
                        invoice_type="adjustment",
                        amount=refund_amount,
                        due_date=due_date,
                        status="unpaid",
                        description=f"Refund of excess security deposit for Lease {lease.id}",
                        is_final=True,
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
            }, status=200)


@extend_schema(tags=["Lease Rent History"])
class LeaseRentHistoryViewSet(RenterAccessMixin,viewsets.ModelViewSet):
    queryset = LeaseRentHistory.objects.all()
    serializer_class = LeaseRentHistorySerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
