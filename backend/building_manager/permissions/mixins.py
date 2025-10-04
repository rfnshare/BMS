from rest_framework.exceptions import PermissionDenied

class RenterAccessMixin:
    """
    Restrict renter access:
    - Staff/admin: see all
    - Renter: only their own data, and only if they have an active lease
    """

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # Staff/Admin see everything
        if user.is_staff or user.is_superuser:
            return qs

        # Renter restrictions
        if getattr(user, "is_renter", False):
            # Check if renter has any active lease
            from leases.models import Lease
            has_active_lease = Lease.objects.filter(
                renter__user=user,
                status="active"
            ).exists()

            if not has_active_lease:
                # If no active lease, renter sees nothing
                return qs.none()

            # Restrict by related renter/lease
            model = qs.model

            if hasattr(model, "renter"):
                return qs.filter(renter__user=user)

            if hasattr(model, "lease"):
                return qs.filter(lease__renter__user=user)

            if hasattr(model, "leases"):
                return qs.filter(leases__renter__user=user)

            if hasattr(model, "unit"):
                return qs.filter(unit__leases__renter__user=user)

            if hasattr(model, "floor"):
                return qs.filter(floor__units__leases__renter__user=user)

            # Fallback → no data
            return qs.none()

        return qs.none()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return obj

        if getattr(user, "is_renter", False):
            qs = self.filter_queryset(self.get_queryset())
            if not qs.filter(pk=obj.pk).exists():
                raise PermissionDenied("You do not have access to this object.")

        return obj
