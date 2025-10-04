from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from .models import UnitDocument, RenterDocument, LeaseDocument
from .serializers import UnitDocumentSerializer, RenterDocumentSerializer, LeaseDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from common.pagination import CustomPagination


@extend_schema(tags=["Unit Documents"])
class UnitDocumentViewSet(RenterAccessMixin,viewsets.ModelViewSet):
    """
    ViewSet for managing Unit Documents.
    Supports CRUD operations with filters, search, and pagination.
    """
    queryset = UnitDocument.objects.all()
    serializer_class = UnitDocumentSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]
    filterset_fields = ['unit', 'doc_type']
    search_fields = ['doc_type']
    ordering_fields = ['id', 'uploaded_at', 'doc_type']

@extend_schema(tags=["Renter Documents"])
class RenterDocumentViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = RenterDocument.objects.all()
    serializer_class = RenterDocumentSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def perform_create(self, serializer):
        # link document to renter based on request data
        renter_id = self.request.data.get("renter")
        serializer.save(renter_id=renter_id)

@extend_schema(tags=["Lease Documents"])
class LeaseDocumentViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = LeaseDocument.objects.all().select_related("lease")
    serializer_class = LeaseDocumentSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["lease", "doc_type"]
    search_fields = ["lease__renter__full_name", "lease__unit__name"]
    ordering_fields = ["uploaded_at", "id"]
    ordering = ["-uploaded_at"]