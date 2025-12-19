from rest_framework import viewsets, permissions, filters
from django_filters import rest_framework as django_filters
from drf_spectacular.utils import extend_schema

from permissions.drf import RoleBasedPermission
from .models import Expense
from .serializers import ExpenseSerializer
from common.pagination import CustomPagination


class ExpenseFilter(django_filters.FilterSet):
    """
    Custom FilterSet to support the 'YYYY-MM' month picker from the frontend.
    """
    date_month = django_filters.CharFilter(method='filter_by_month')
    date_from = django_filters.DateFilter(field_name="date", lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name="date", lookup_expr='lte')

    class Meta:
        model = Expense
        # 🔥 FIX: Changed 'renter' to 'lease' to match the updated Model
        fields = ["category", "is_renter_related", "lease", "date"]

    def filter_by_month(self, queryset, name, value):
        return queryset.filter(date__startswith=value)


@extend_schema(tags=["Expenses"])
class ExpenseViewSet(viewsets.ModelViewSet):
    # 🔥 FIX: select_related('lease') instead of 'renter'
    queryset = Expense.objects.select_related("lease", "created_by").all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter

    # 🔥 FIX: Search fields updated to look through lease -> renter
    search_fields = ["title", "description", "lease__renter__full_name"]
    ordering_fields = ["amount", "date", "created_at"]
    ordering = ["-date"]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return super().get_queryset()

        # 2. Renters only see their own linked expenses via Lease
        if hasattr(user, "renter_profile"):
            return super().get_queryset().filter(lease__renter=user.renter_profile)
        elif getattr(user, "is_renter", False):
            return super().get_queryset().filter(lease__renter__user=user)

        return Expense.objects.none()