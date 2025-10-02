from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from common.pagination import CustomPagination
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from .models import Invoice
from .serializers import InvoiceSerializer


@extend_schema(tags=["Invoices"])
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related("lease", "lease__renter", "lease__unit")
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
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
