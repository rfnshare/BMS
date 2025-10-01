# permissions/custom_permissions.py
from rest_framework import permissions

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
