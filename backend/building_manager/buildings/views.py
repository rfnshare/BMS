from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.pagination import CustomPagination
from documents.models import UnitDocument
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from .models import Floor, Unit
from .serializers import FloorSerializer, UnitSerializer, UnitDocumentSerializer


@extend_schema(tags=["Floors"])
class FloorViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing floors.
    """
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["id", "created_at", "name"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        floor = self.get_object()

        # 🔒 Block deletion if units exist
        if floor.units.exists():
            return Response(
                {
                    "message": "Before removing floor, remove relevant units first."
                },
                status=status.HTTP_409_CONFLICT
            )

        self.perform_destroy(floor)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=["Units"])
class UnitViewSet(RenterAccessMixin, viewsets.ModelViewSet):

    """
    ViewSet for managing units and their documents.
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['floor', 'unit_type', 'status']
    search_fields = ['name']
    ordering_fields = ['id', 'created_at', 'name']

    @extend_schema(
        responses={200: UnitDocumentSerializer(many=True)},
        summary="List documents for a unit",
        description="Returns all documents attached to the selected unit."
    )
    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        unit = self.get_object()
        serializer = UnitDocumentSerializer(unit.documents.all(), many=True)
        return Response(serializer.data)

    @extend_schema(
        request=UnitDocumentSerializer,
        responses={201: UnitDocumentSerializer},
        summary="Upload a document",
        description="Attach a document to the selected unit."
    )
    @action(detail=True, methods=["post"])
    def upload_document(self, request, pk=None):
        unit = self.get_object()
        serializer = UnitDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(unit=unit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        request=UnitDocumentSerializer,
        responses={
            200: UnitDocumentSerializer,
            404: OpenApiResponse(description="Document not found")
        },
        summary="Update a unit document",
        description="Update metadata or file of a specific document attached to the unit."
    )
    @extend_schema(
        parameters=[
            OpenApiParameter(name='doc_id', type=int, location=OpenApiParameter.PATH)
        ]
    )
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

    @extend_schema(
        responses={
            204: OpenApiResponse(description="Document deleted"),
            404: OpenApiResponse(description="Document not found")
        },
        summary="Delete a unit document",
        description="Deletes a specific document attached to the unit."
    )
    @extend_schema(
        parameters=[
            OpenApiParameter(name='doc_id', type=int, location=OpenApiParameter.PATH)
        ]
    )
    @action(detail=True, methods=["delete"], url_path="delete_document/(?P<doc_id>[^/.]+)")
    def delete_document(self, request, pk=None, doc_id=None):
        unit = self.get_object()
        try:
            doc = unit.documents.get(id=doc_id)
            doc.delete()
            return Response({"message": "Document deleted"}, status=status.HTTP_204_NO_CONTENT)
        except UnitDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = True  # ✅ allow partial updates
        instance = self.get_object()

        print("Incoming PUT data for unit update:", request.data)

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)

        # 🔴 This is what you need to see
        print("Unit update validation errors:", serializer.errors)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def create(self, request, *args, **kwargs):
        # Log the incoming request data
        print("Incoming POST data for unit creation:", request.data)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Log serializer validation errors
            print("Unit creation validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)