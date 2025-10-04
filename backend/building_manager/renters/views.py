from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter
from common.pagination import CustomPagination
from permissions.drf import RoleBasedPermission
from permissions.mixins import RenterAccessMixin
from .models import Renter
from .serializers import RenterSerializer, RenterProfileSerializer
from django_filters.rest_framework import DjangoFilterBackend

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

class RenterProfileViewSet(RenterAccessMixin, viewsets.ModelViewSet):
    serializer_class = RenterProfileSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]  # Renter can update their own profile

    def get_queryset(self):
        return Renter.objects.filter(user=self.request.user)