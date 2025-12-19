from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import AppPermission

class RoleBasedPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        # 1. Superadmins should NEVER get a 403
        if user.is_superuser or getattr(user, 'is_superadmin', False):
            return True

        # 2. Identify the model correctly
        model_cls = getattr(getattr(view, "queryset", None), "model", None)
        if not model_cls:
            return False

        app_label = model_cls._meta.app_label  # should be 'renters'
        model_name = model_cls.__name__  # should be 'Renter'

        # 3. Check the Database Rule
        if user.is_staff or getattr(user, 'is_manager', False):
            # We check if THIS user is in the 'assigned_to' for this specific model
            perms = AppPermission.objects.filter(
                app_label__iexact=app_label,
                model_name__iexact=model_name,
                assigned_to=user  # Checks the ManyToMany relationship
            ).first()

            if not perms:
                return False  # No rule found for this staff member = 403

            # 4. Map Methods to your Boolean Fields
            if request.method in SAFE_METHODS: return perms.can_read
            if request.method == "POST": return perms.can_create
            if request.method in ["PUT", "PATCH"]: return perms.can_update
            if request.method == "DELETE": return perms.can_delete

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