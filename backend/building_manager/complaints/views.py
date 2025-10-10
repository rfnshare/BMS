# complaints/views.py
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets, filters, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Complaint
from .serializers import ComplaintSerializer


class IsRenterOrAdminCreatePermission(permissions.BasePermission):
    """
    Custom permission:
    - Renters can create complaints
    - Admins can create or update status
    - Everyone else read-only
    """

    def has_permission(self, request, view):
        if view.action in ["create"]:
            return request.user.is_staff or getattr(request.user, "is_renter", False)
        if view.action in ["partial_update", "update"]:
            # Only admin can update
            return request.user.is_staff
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if getattr(request.user, "is_renter", False):
            return obj.renter.user == request.user
        return False


@extend_schema(tags=["Complaints"])
class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, IsRenterOrAdminCreatePermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["title", "description", "renter__full_name"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Complaint.objects.all()
        elif getattr(user, "is_renter", False):
            return Complaint.objects.filter(renter__user=user)
        return Complaint.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "is_renter", False):
            # Auto-link complaint to renter
            serializer.save(renter=user.renter_profile)
        else:
            # Admin can provide renter in POST data
            serializer.save()

    def update(self, request, *args, **kwargs):
        # Only allow admin to update status
        if not request.user.is_staff:
            return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, partial=True, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
