from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.pagination import CustomPagination
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from .models import Renter
from .serializers import RenterSerializer, RenterProfileSerializer


@extend_schema(tags=["Renters"])
class RenterViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    queryset = Renter.objects.all()
    serializer_class = RenterSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["gender", "marital_status", "occupation"]
    search_fields = ["full_name", "phone_number", "email", "emergency_contact_name"]
    ordering_fields = ["full_name", "date_of_birth", "created_at"]
    ordering = ["full_name"]

    def perform_create(self, serializer):
        # automatically link user if needed
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Renter.objects.all()
        elif user.is_renter:
            return Renter.objects.filter(user=user)
        else:
            return Renter.objects.none()

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        renter = Renter.objects.get(user=request.user)

        if request.method == "GET":
            return Response(RenterProfileSerializer(renter).data)

        if request.method == "PATCH":
            # 1. Update User-level data first
            user = renter.user
            email_updated = False

            if "email" in request.data:
                user.email = request.data["email"]
                email_updated = True

            if "phone_number" in request.data:
                user.phone_number = request.data["phone_number"]
                user.username = request.data["phone_number"]  # Keep username synced
                email_updated = True

            if email_updated:
                user.save()

            # 2. Update Renter-level data using the Serializer
            serializer = RenterProfileSerializer(renter, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

    def perform_update(self, serializer):
        print(serializer.validated_data)
        """
        Override perform_update to update associated User's fields if changed in Renter
        """
        renter = serializer.instance
        user = renter.user

        # Check if phone_number is being updated in Renter model
        new_phone_number = serializer.validated_data.get('phone_number')
        if new_phone_number and new_phone_number != renter.phone_number:
            renter.phone_number = new_phone_number
            user.phone_number = new_phone_number  # Update the phone_number in User model as well
            user.username = new_phone_number
            user.save()

        # Check if email is being updated in Renter model
        new_email = serializer.validated_data.get('email')
        if new_email and new_email != user.email:
            user.email = new_email
            user.save()

        # Save the updated renter instance
        serializer.save()

