# scheduling/api/views.py
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status, views, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.views import APIView

from common.pagination import CustomPagination
from permissions.drf import RoleBasedPermission
from scheduling.models import TaskLog
from scheduling.api.serializers import TaskLogSerializer
from invoices.models import Invoice
from leases.models import Lease
from datetime import date, timedelta


@extend_schema(tags=["Scheduling"])
class TaskLogListView(generics.ListAPIView):
    """
    List all task logs with filtering, search, and pagination.
    """
    queryset = TaskLog.objects.all()
    serializer_class = TaskLogSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["task_name", "status", "executed_by"]
    search_fields = ["task_name", "message", "executed_by__username"]
    ordering_fields = ["executed_at", "status"]
    ordering = ["-executed_at"]


@extend_schema(tags=["Scheduling"])
class ManualInvoiceGenerationView(APIView):
    """
    Allows admin/staff to manually trigger monthly rent invoice creation
    for all active leases. Skips if an invoice already exists for the current month.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def post(self, request, *args, **kwargs):
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        user = request.user

        created_count = 0
        skipped_count = 0
        messages = []

        active_leases = Lease.objects.filter(status="active")

        for lease in active_leases:
            # Check if invoice already exists this month
            if Invoice.objects.filter(
                lease=lease,
                invoice_type="rent",
                invoice_date__gte=current_month_start
            ).exists():
                skipped_count += 1
                messages.append(f"Skipped lease {lease.id} — invoice already exists")
                continue

            due_date = current_month_start + timedelta(days=7)  # configurable later

            invoice = Invoice.objects.create(
                lease=lease,
                invoice_type="rent",
                amount=lease.rent_amount,
                due_date=due_date,
                status="unpaid",
                description=f"Monthly rent for {today.strftime('%B %Y')}"
            )

            created_count += 1
            messages.append(f"Created invoice {invoice.invoice_number or invoice.id} for lease {lease.id}")

        # ✅ Log the operation in TaskLog
        TaskLog.objects.create(
            task_name="Manual Monthly Invoice Generation",
            status="SUCCESS",
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "message": "Manual invoice generation completed",
            "created": created_count,
            "skipped": skipped_count,
            "details": messages
        }, status=status.HTTP_200_OK)

@extend_schema(tags=["Scheduling"])
class ManualRentReminderView(APIView):
    """
    Manually send reminders for invoices due in next 3 days.
    Accessible by staff/admin only.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request):
        user = request.user
        today = timezone.now().date()
        due_soon = today + timedelta(days=3)

        invoices_due = Invoice.objects.filter(
            due_date__lte=due_soon,
            status__in=["draft", "unpaid", "partially_paid"]
        )

        count = invoices_due.count()

        # Log Task Execution
        TaskLog.objects.create(
            task_name="LEASE_REMINDER",
            status="SUCCESS",
            message=f"{count} invoices due within 3 days",
            executed_by=user
        )

        # TODO: Integrate Notifications later
        # for invoice in invoices_due:
        #     send_notification(invoice)

        return Response({
            "status": "success",
            "message": f"{count} invoices due soon processed for reminders"
        })

@extend_schema(tags=["Scheduling"])
class ManualOverdueDetectionView(APIView):
    """
    Manually detect overdue invoices (older than 30 days).
    Accessible by staff/admin only.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request):
        user = request.user
        today = timezone.now().date()
        overdue_threshold = today - timedelta(days=30)

        overdue_invoices = Invoice.objects.filter(
            due_date__lte=overdue_threshold,
            status__in=["draft", "unpaid", "partially_paid"]
        )

        count = overdue_invoices.count()

        # Log Task Execution
        TaskLog.objects.create(
            task_name="CUSTOM",
            status="SUCCESS",
            message=f"{count} overdue invoices detected",
            executed_by=user
        )

        # Optional: mark as flagged for follow-up
        # overdue_invoices.update(flagged=True)

        return Response({
            "status": "success",
            "message": f"{count} overdue invoices detected"
        })
