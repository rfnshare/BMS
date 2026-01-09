from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from common.pagination import CustomPagination
from notifications.utils import NotificationService
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from scheduling.models import TaskLog
from .models import Invoice
from .serializers import InvoiceSerializer
from .services import generate_invoice_pdf
from django.conf import settings
from scheduling.api.views import get_email_message, get_whatsapp_message

@extend_schema(tags=["Invoices"])
class InvoiceViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related("lease", "lease__renter", "lease__unit")
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "lease", "lease__id", "lease__renter__id"]
    search_fields = ["invoice_number", "lease__renter__full_name"]
    ordering_fields = ["invoice_date", "due_date", "amount", "created_at"]
    ordering = ["-invoice_date"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        elif user.is_renter:
            return self.queryset.filter(lease__renter__user=user)
        return Invoice.objects.none()

    @action(detail=True, methods=["post"], url_path="generate_pdf")
    def generate_pdf(self, request, pk=None):
        invoice = self.get_object()
        try:
            path = generate_invoice_pdf(invoice)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # optionally send invoice via email/whatsapp here
        return Response({"pdf": invoice.invoice_pdf.url}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="resend_notification")
    def resend_notification(self, request, pk=None):
        invoice = self.get_object()
        user = request.user

        # 1. CREATE THE TASK LOG (Traceability Parent for the manual action)
        task_log = TaskLog.objects.create(
            task_name="MANUAL_RESEND_NOTIFICATION",
            status="IN_PROGRESS",
            executed_by=user,
            message=f"Manual resend triggered for Invoice #{invoice.invoice_number}"
        )

        try:
            # 2. Ensure PDF exists
            if not invoice.invoice_pdf:
                generate_invoice_pdf(invoice)
                invoice.refresh_from_db()

            renter = invoice.lease.renter
            attachment_url = None
            if invoice.invoice_pdf:
                attachment_url = invoice.invoice_pdf.url
                if not attachment_url.startswith("http"):
                    site_url = getattr(settings, "SITE_URL", "").rstrip("/")
                    attachment_url = f"{site_url}{attachment_url}"

            # 3. Trigger Email
            email_status = "Skipped"
            if renter.prefers_email and renter.user.email:
                subject, body = get_email_message(invoice, renter, message_type="invoice_created")
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="email",
                    subject=subject,
                    message=body,
                    invoice=invoice,
                    sent_by=user,
                    attachment_url=attachment_url,
                    task_log=task_log
                )
                email_status = "Sent"

            # 4. Trigger WhatsApp
            whatsapp_status = "Skipped"
            if renter.prefers_whatsapp and renter.phone_number:
                message = get_whatsapp_message(invoice, renter, message_type="invoice_created")
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="whatsapp",
                    message=message,
                    invoice=invoice,
                    sent_by=user,
                    attachment_url=attachment_url,
                    task_log=task_log
                )
                whatsapp_status = "Sent"

            # 5. Finalize TaskLog
            task_log.status = "SUCCESS"
            task_log.message = f"Successfully resent to Email: {email_status}, WA: {whatsapp_status}"
            task_log.save()

            return Response({
                "detail": "Notifications triggered.",
                "email": email_status,
                "whatsapp": whatsapp_status
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Catch errors and update the log
            task_log.status = "FAILURE"
            task_log.message = f"Error during resend: {str(e)}"
            task_log.save()
            return Response({"detail": "Failed to resend."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
