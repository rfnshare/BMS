from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import UnitDocument
from .serializers import UnitDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from common.pagination import CustomPagination

class UnitDocumentViewSet(viewsets.ModelViewSet):
    queryset = UnitDocument.objects.all()
    serializer_class = UnitDocumentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
    pagination_class = CustomPagination
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]
    filterset_fields = ['unit', 'doc_type']  # filterable
    search_fields = ['doc_type']  # searchable
    ordering_fields = ['id', 'uploaded_at', 'doc_type']  # ordering allowed
