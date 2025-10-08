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
    View all sent notifications (filterable by type, channel, status, or user)
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filterset_fields = ["notification_type", "channel", "status", "sent_by"]
    search_fields = ["recipient", "subject", "message"]
    ordering_fields = ["sent_at", "status"]
