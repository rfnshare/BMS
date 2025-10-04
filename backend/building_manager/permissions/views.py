# permissions/views.py
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .drf import RoleBasedPermission
from .models import AppPermission
from .serializers import AppPermissionSerializer


@extend_schema(tags=["Permissions"])
class AppPermissionViewSet(viewsets.ModelViewSet):
    queryset = AppPermission.objects.all()
    serializer_class = AppPermissionSerializer
    permission_classes = [RoleBasedPermission]  # Only superadmin
