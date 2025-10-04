# permissions/drf.py
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import AppPermission
from django.db.models import Q


class RoleBasedPermission(BasePermission):
    """
    Custom permission check:
    - Admin: always allowed
    - Staff: limited by AppPermission
    - Renter: read-only for their own data; can update their profile fields
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin -> full access
        if user.is_superuser:
            return True

        # Determine model info
        if hasattr(view, "queryset") and view.queryset is not None:
            model_class = view.queryset.model
            app_label = model_class._meta.app_label
            model_name = model_class.__name__
        else:
            # fallback: allow safe access
            return request.method in SAFE_METHODS

        # Staff permissions
        if user.is_staff:
            perms = AppPermission.objects.filter(
                role="staff",
                app_label=app_label,
                model_name=model_name,
                assigned_to=user
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
            # Only allow GET, HEAD, OPTIONS for most models
            if request.method in SAFE_METHODS:
                return True
            # For PUT/PATCH, only allow Renter profile update
            if request.method in ["PUT", "PATCH"]:
                # Check if this is Renter model
                if model_name.lower() == "renter":
                    return True
            return False

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Admin -> full access
        if user.is_superuser:
            return True

        # Staff -> delegate to has_permission
        if user.is_staff:
            return self.has_permission(request, view)

        # Renter object-level rules
        if getattr(user, "is_renter", False):
            # Renter profile
            if hasattr(obj, "user") and obj.user_id == user.id:
                return True

            # Lease, Invoice, Payment
            # Lease
            if hasattr(obj, "renter") and obj.renter.user_id == user.id:
                return True
            # Payment
            if hasattr(obj, "invoice") and hasattr(obj.invoice,
                                                   "lease") and obj.invoice.lease.renter.user_id == user.id:
                return True
            # Invoice
            if hasattr(obj, "lease") and obj.lease.renter.user_id == user.id:
                return True
            # LeaseRentHistory
            if hasattr(obj, "lease") and obj.lease.renter.user_id == user.id:
                return True

            # Default deny
            return False

        return False
