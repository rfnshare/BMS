from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from common.pagination import CustomPagination
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
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

        # 1. Ensure PDF exists (if not, generate it first)
        if not invoice.invoice_pdf:
            generate_invoice_pdf(invoice)
            invoice.refresh_from_db()

        renter = invoice.lease.renter

        # 2. Get the full attachment URL
        attachment_url = None
        if invoice.invoice_pdf:
            attachment_url = invoice.invoice_pdf.url
            if not attachment_url.startswith("http"):
                site_url = getattr(settings, "SITE_URL", "").rstrip("/")
                attachment_url = f"{site_url}{attachment_url}"

        # 3. Trigger Email if preferred
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
                sent_by=request.user,  # The admin who clicked the button
                attachment_url=attachment_url
            )
            email_status = "Sent"

        # 4. Trigger WhatsApp if preferred
        whatsapp_status = "Skipped"
        if renter.prefers_whatsapp and renter.phone_number:
            message = get_whatsapp_message(invoice, renter, message_type="invoice_created")
            NotificationService.send(
                notification_type="invoice_created",
                renter=renter,
                channel="whatsapp",
                message=message,
                invoice=invoice,
                sent_by=request.user,
                attachment_url=attachment_url
            )
            whatsapp_status = "Sent"

        return Response({
            "detail": "Notifications triggered.",
            "email": email_status,
            "whatsapp": whatsapp_status
        }, status=status.HTTP_200_OK)
