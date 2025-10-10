# notifications/api/views.py
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from common.pagination import CustomPagination
from notifications.api.serializers import NotificationSerializer
from notifications.models import Notification
from permissions.drf import RoleBasedPermission


@extend_schema(tags=["Notifications"])
class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination
    filterset_fields = ["notification_type", "channel", "status"]
    search_fields = ["recipient", "subject", "message"]
    ordering_fields = ["sent_at", "status"]
