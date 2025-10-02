from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from common.pagination import CustomPagination
from documents.models import LeaseDocument
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from .models import Lease, LeaseRentHistory
from .serializers import LeaseSerializer, LeaseDocumentSerializer, LeaseRentHistorySerializer


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

    def perform_create(self, serializer):
        lease = serializer.save()
        # future: auto-generate first invoice here if needed
        return lease


@extend_schema(tags=["Lease Rent History"])
class LeaseRentHistoryViewSet(viewsets.ModelViewSet):
    queryset = LeaseRentHistory.objects.all()
    serializer_class = LeaseRentHistorySerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
