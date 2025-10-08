from datetime import timedelta

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import CustomPagination
from invoices.models import Invoice
from leases.models import Lease
from notifications.utils import NotificationService
from permissions.drf import RoleBasedPermission
from scheduling.api.serializers import TaskLogSerializer
from scheduling.models import TaskLog


# -------------------------------
# Task Log List
# -------------------------------
@extend_schema(tags=["Scheduling"])
class TaskLogListView(generics.ListAPIView):
    queryset = TaskLog.objects.all()
    serializer_class = TaskLogSerializer
    permission_classes = [RoleBasedPermission]
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
    and send notifications according to renter preferences.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request, *args, **kwargs):
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        user = request.user

        created_count = 0
        skipped_count = 0
        messages = []

        active_leases = Lease.objects.filter(status="active")

        for lease in active_leases:
            renter = lease.renter  # Assuming Lease has FK to Renter

            # Check if invoice already exists this month
            if Invoice.objects.filter(lease=lease, invoice_type="rent", invoice_date__gte=current_month_start).exists():
                skipped_count += 1
                messages.append(f"Skipped lease {lease.id} — invoice already exists")
                continue

            due_date = current_month_start + timedelta(days=7)
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

            # Send notifications based on renter preferences
            if renter.prefers_email:
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="email",
                    subject=f"Invoice {invoice.invoice_number}",
                    message=f"Your invoice {invoice.invoice_number} is generated. Amount due: {invoice.amount}.",
                    invoice=invoice,
                    sent_by=user
                )
            if renter.prefers_whatsapp:
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="whatsapp",
                    subject=None,
                    message=f"Invoice {invoice.invoice_number} generated. Amount due: {invoice.amount}.",
                    invoice=invoice,
                    sent_by=user
                )

        # Log Task
        TaskLog.objects.create(
            task_name="GENERATE_INVOICES",
            status="SUCCESS",
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "message": "Manual invoice generation completed",
            "created": created_count,
            "skipped": skipped_count,
            "details": messages
        })


@extend_schema(tags=["Scheduling"])
class ManualRentReminderView(APIView):
    """
    Manually send reminders for invoices due in next 3 days.
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

        messages = []

        for invoice in invoices_due:
            renter = invoice.lease.renter
            if renter.prefers_email:
                NotificationService.send(
                    notification_type="rent_reminder",
                    renter=renter,
                    channel="email",
                    subject=f"Upcoming Rent Due: {invoice.invoice_number}",
                    message=f"Reminder: Your invoice {invoice.invoice_number} is due on {invoice.due_date}.",
                    invoice=invoice,
                    sent_by=user
                )
            if renter.prefers_whatsapp:
                NotificationService.send(
                    notification_type="rent_reminder",
                    renter=renter,
                    channel="whatsapp",
                    subject=None,
                    message=f"Reminder: Invoice {invoice.invoice_number} is due on {invoice.due_date}.",
                    invoice=invoice,
                    sent_by=user
                )
            messages.append(f"Reminder sent for invoice {invoice.invoice_number}")

        TaskLog.objects.create(
            task_name="LEASE_REMINDER",
            status="SUCCESS",
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "status": "success",
            "message": f"{len(invoices_due)} reminders processed"
        })


@extend_schema(tags=["Scheduling"])
class ManualOverdueDetectionView(APIView):
    """
    Manually detect overdue invoices (older than 30 days) and notify.
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

        messages = []

        for invoice in overdue_invoices:
            renter = invoice.lease.renter
            if renter.prefers_email:
                NotificationService.send(
                    notification_type="overdue_notice",
                    renter=renter,
                    channel="email",
                    subject=f"Overdue Invoice {invoice.invoice_number}",
                    message=f"Your invoice {invoice.invoice_number} is overdue since {invoice.due_date}. Please pay immediately.",
                    invoice=invoice,
                    sent_by=user
                )
            if renter.prefers_whatsapp:
                NotificationService.send(
                    notification_type="overdue_notice",
                    renter=renter,
                    channel="whatsapp",
                    subject=None,
                    message=f"Overdue: Invoice {invoice.invoice_number} since {invoice.due_date}. Please pay.",
                    invoice=invoice,
                    sent_by=user
                )
            messages.append(f"Overdue notice sent for invoice {invoice.invoice_number}")

        TaskLog.objects.create(
            task_name="CUSTOM",
            status="SUCCESS",
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "status": "success",
            "message": f"{len(overdue_invoices)} overdue notices processed"
        })
