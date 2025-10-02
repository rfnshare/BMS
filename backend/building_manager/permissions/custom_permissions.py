# permissions/custom_permissions.py
from rest_framework import permissions

from payments.models import Payment


class IsStaffOrReadOnlyForRenter(permissions.BasePermission):
    """
    Allow staff/admin to do anything.
    Renter can only read (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        # Staff or superuser can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Renter can only GET/HEAD/OPTIONS
        if request.method in permissions.SAFE_METHODS and hasattr(request.user, "is_renter") and request.user.is_renter:
            return True

        return False

class IsStaffOrReadOnlyForPayment(permissions.BasePermission):
    """
    Staff/admin can do anything.
    Renter can only read (GET/HEAD/OPTIONS) their own payments.
    """

    def has_permission(self, request, view):
        # Staff or superuser can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Renter can only read
        if request.method in permissions.SAFE_METHODS and hasattr(request.user, "is_renter") and request.user.is_renter:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        # Staff can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Renter can only view their own payments
        if hasattr(request.user, "is_renter") and request.user.is_renter:
            if isinstance(obj, Payment):
                # Payment -> Invoice -> Lease -> Renter
                return obj.invoice.lease.renter.user_id == request.user.id
            return False

        return False