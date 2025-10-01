from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import UnitDocument, RenterDocument
from .serializers import UnitDocumentSerializer, RenterDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from common.pagination import CustomPagination


@extend_schema(tags=["Unit Documents"])
class UnitDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Unit Documents.
    Supports CRUD operations with filters, search, and pagination.
    """
    queryset = UnitDocument.objects.all()
    serializer_class = UnitDocumentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
    pagination_class = CustomPagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]
    filterset_fields = ['unit', 'doc_type']
    search_fields = ['doc_type']
    ordering_fields = ['id', 'uploaded_at', 'doc_type']


class RenterDocumentViewSet(viewsets.ModelViewSet):
    queryset = RenterDocument.objects.all()
    serializer_class = RenterDocumentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]

    def perform_create(self, serializer):
        # link document to renter based on request data
        renter_id = self.request.data.get("renter")
        serializer.save(renter_id=renter_id)