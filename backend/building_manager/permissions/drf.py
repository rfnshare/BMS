from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import AppPermission


class RoleBasedPermission(BasePermission):
    """
    Custom permission check:
    - Admin: always allowed
    - Staff: limited by AppPermission
    - Renter: read-only and only their own assigned data
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin -> always allowed
        if user.is_superuser:
            return True

        # Get app + model from view
        app_label = view.queryset.model._meta.app_label
        model_name = view.queryset.model.__name__

        # Staff
        if user.is_staff:
            perms = AppPermission.objects.filter(
                role="staff",
                app_label=app_label,
                model_name=model_name,
                assigned_to=user,
            ).first()
            if not perms:
                return False

            if request.method in SAFE_METHODS:
                return perms.can_read
            if request.method == "POST":
                return perms.can_create
            if request.method in ["PUT", "PATCH"]:
                return perms.can_update
            if request.method == "DELETE":
                return perms.can_delete

        # Renter
        if getattr(user, "is_renter", False):
            return request.method in SAFE_METHODS  # more filtering done in object-level check

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if user.is_staff:
            return self.has_permission(request, view)

        if getattr(user, "is_renter", False):
            # Example: renter can only view their lease/unit
            if hasattr(obj, "lease_set"):
                return obj.lease_set.filter(renter=user).exists()
            if hasattr(obj, "renter") and obj.renter == user:
                return True
            return False

        return False
