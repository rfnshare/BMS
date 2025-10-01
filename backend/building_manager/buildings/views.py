# building_manager/buildings/views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, generics, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Floor, Unit
from .serializers import FloorSerializer, UnitSerializer, UnitDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from rest_framework.parsers import MultiPartParser, FormParser
from common.pagination import CustomPagination
from documents.models import UnitDocument


class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
    pagination_class = CustomPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['name', 'status']  # filterable fields
    search_fields = ['name']  # searchable fields
    ordering_fields = ['id', 'created_at', 'name']  # allowed ordering fields

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]

    filter_backends = [
        DjangoFilterBackend,  # for exact field filtering
        filters.SearchFilter,  # for search by name/other fields
        filters.OrderingFilter  # for ordering
    ]
    filterset_fields = ['floor', 'unit_type', 'status']  # filterable fields
    search_fields = ['name']  # searchable fields
    ordering_fields = ['id', 'created_at', 'name']

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        """List all documents for this unit"""
        unit = self.get_object()
        serializer = UnitDocumentSerializer(unit.documents.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def upload_document(self, request, pk=None):
        """Upload a document to this unit"""
        unit = self.get_object()
        serializer = UnitDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(unit=unit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["put"], url_path="update_document/(?P<doc_id>[^/.]+)")
    def update_document(self, request, pk=None, doc_id=None):
        unit = self.get_object()
        try:
            doc = unit.documents.get(id=doc_id)
        except UnitDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        serializer = UnitDocumentSerializer(doc, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["delete"], url_path="delete_document/(?P<doc_id>[^/.]+)")
    def delete_document(self, request, pk=None, doc_id=None):
        unit = self.get_object()
        try:
            doc = unit.documents.get(id=doc_id)
            doc.delete()
            return Response({"message": "Document deleted"}, status=status.HTTP_204_NO_CONTENT)
        except UnitDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)



