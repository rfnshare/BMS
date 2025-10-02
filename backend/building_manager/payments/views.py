# payments/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from common.pagination import CustomPagination
from .models import Payment
from .serializers import PaymentSerializer, BulkPaymentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForPayment

@extend_schema(tags=["Payments"])
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("-payment_date", "-id")
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForPayment]
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["method", "invoice", "lease"]
    search_fields = ["transaction_reference", "notes"]
    ordering_fields = ["payment_date", "amount", "id"]
    ordering = ["-payment_date", "-id"]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_payment(self, request):
        serializer = BulkPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payments = serializer.save()
        return Response({
            "status": "success",
            "payments_created": [p.id for p in payments]
        }, status=status.HTTP_201_CREATED)