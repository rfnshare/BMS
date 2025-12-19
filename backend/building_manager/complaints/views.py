from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from drf_spectacular.utils import extend_schema

# Use your project's pagination and permissions
from common.pagination import CustomPagination
from .models import Complaint
from .serializers import ComplaintSerializer


class ComplaintFilter(django_filters.FilterSet):
    """
    Advanced filtering for the dashboard
    """
    status = django_filters.CharFilter(lookup_expr='iexact')
    priority = django_filters.CharFilter(lookup_expr='iexact')
    lease = django_filters.NumberFilter()

    class Meta:
        model = Complaint
        fields = ["status", "priority", "lease"]


@extend_schema(tags=["Complaints"])
class ComplaintViewSet(viewsets.ModelViewSet):
    # 🔥 Optimization: Fetch Lease, Renter, Unit, and Creator in 1 query
    queryset = Complaint.objects.select_related(
        "lease",
        "lease__renter",
        "lease__unit",
        "created_by"
    ).all()

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]  # Add RoleBasedPermission here if you have it
    pagination_class = CustomPagination

    # 🔥 Filters & Search
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ComplaintFilter

    # Search inside the related tables
    search_fields = ["title", "description", "lease__renter__full_name", "lease__unit__unit_number"]

    # Allow sorting by priority and date
    ordering_fields = ["created_at", "updated_at", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Staff sees all complaints.
        Renters only see complaints linked to their Lease.
        """
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()

        # If user is a renter, find complaints linked to their active leases
        if getattr(user, "is_renter", False):
            # 🔥 FIX: Traverse Lease -> Renter -> User
            return super().get_queryset().filter(lease__renter__user=user)

        return Complaint.objects.none()

    def perform_create(self, serializer):
        """
        Auto-assign 'created_by'. 
        If a Renter submits, we could auto-link their active lease here,
        but for Admin Dashboard, the Admin selects the lease manually.
        """
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Allow full updates for Staff.
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff can update ticket status/details."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Allow delete for Staff (e.g. removing accidental duplicates).
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "Method not allowed."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)