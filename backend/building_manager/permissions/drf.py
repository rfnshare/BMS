from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import AppPermission

class RoleBasedPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        # Determine model from view
        model_cls = getattr(getattr(view, "queryset", None), "model", None)
        if not model_cls and hasattr(view, "get_queryset"):
            qs = view.get_queryset()
            model_cls = getattr(qs, "model", None)
        if not model_cls:
            return False

        app_label = model_cls._meta.app_label
        model_name = model_cls.__name__

        if user.is_staff:
            perms = AppPermission.objects.filter(
                role="staff",
                app_label__iexact=app_label,
                model_name__iexact=model_name,
                assigned_to__in=[user]
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

        # renter read-only handled separately
        if getattr(user, "is_renter", False):
            return request.method in SAFE_METHODS

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser:
            return True
        if user.is_staff:
            return self.has_permission(request, view)
        if getattr(user, "is_renter", False):
            if hasattr(obj, "renter") and obj.renter.user_id == user.id:
                return True
            if hasattr(obj, "user") and obj.user_id == user.id:
                return True
            if hasattr(obj, "lease_set"):
                return obj.lease_set.filter(renter__user=user).exists()
        return False