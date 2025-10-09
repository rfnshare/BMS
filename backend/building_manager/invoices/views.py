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
