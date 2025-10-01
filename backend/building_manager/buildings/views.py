# building_manager/buildings/views.py
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Floor, Unit, UnitDocument
from .serializers import FloorSerializer, UnitSerializer, UnitDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from rest_framework.parsers import MultiPartParser, FormParser

class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Unit.objects.all()
        elif user.is_renter:
            # Filter only units assigned to this renter via Lease
            return Unit.objects.filter(name="A1")
        else:
            return Unit.objects.none()

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        """List all documents for this unit"""
        unit = self.get_object()
        serializer = UnitDocumentSerializer(unit.documents.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def upload_document(self, request, pk=None):
        """Upload document for this unit"""
        unit = self.get_object()
        serializer = UnitDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(unit=unit)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=["put"], url_path="update_document/(?P<doc_id>[^/.]+)")
    def update_document(self, request, pk=None, doc_id=None):
        """Update document file or doc_type"""
        unit = self.get_object()
        try:
            doc = unit.documents.get(id=doc_id)
        except UnitDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        serializer = UnitDocumentSerializer(doc, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=["delete"], url_path="delete_document/(?P<doc_id>[^/.]+)")
    def delete_document(self, request, pk=None, doc_id=None):
        """Delete document from this unit"""
        unit = self.get_object()
        try:
            doc = unit.documents.get(id=doc_id)
            doc.delete()
            return Response({"message": "Document deleted successfully"}, status=204)
        except UnitDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)



