from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from permissions.drf import RoleBasedPermission
from .models import Expense
from .serializers import ExpenseSerializer
from common.pagination import CustomPagination


@extend_schema(tags=["Expenses"])
class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("renter", "created_by").all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "is_renter_related", "renter"]
    search_fields = ["title", "description", "renter__full_name"]
    ordering_fields = ["amount", "date", "created_at"]
    ordering = ["-date"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Expense.objects.all()
        elif getattr(user, "is_renter", False):
            return Expense.objects.filter(renter__user=user)
        return Expense.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
