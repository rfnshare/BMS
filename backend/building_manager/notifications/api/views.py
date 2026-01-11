# notifications/api/views.py
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from common.pagination import CustomPagination
from notifications.models import Notification
from notifications.api.serializers import NotificationSerializer
from permissions.drf import RoleBasedPermission


@extend_schema(tags=["Notifications"])
class NotificationListView(generics.ListAPIView):
    """
    View notifications. Staff see all; Renters see only their own.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filterset_fields = ["notification_type", "channel", "status", "sent_by"]
    search_fields = ["recipient", "subject", "message"]
    ordering_fields = ["sent_at", "status"]

    def get_queryset(self):
        user = self.request.user

        # 1. Staff/Admin check
        if user.is_superadmin or user.is_manager:
            return Notification.objects.all()

        # 2. Renter check
        # We filter the Notification table where the 'renter'
        # is the one linked to this logged-in user.
        return Notification.objects.filter(renter__user=user)
