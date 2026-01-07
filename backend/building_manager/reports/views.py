# reports/views.py
from datetime import datetime
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from permissions.drf import RoleBasedPermission
from common.pagination import CustomPagination

from .services.financial_service import FinancialReportService
from .services.occupancy_service import OccupancyReportService
from .services.renter_service import RenterCollectionReportService
from .serializers import (
    FinancialSummarySerializer, InvoiceListSerializer,
    OccupancySummarySerializer, UnitListSerializer,
    RenterCollectionRowSerializer
)


@extend_schema(tags=["Reports"])
class FinancialSummaryView(APIView):
    permission_classes = [RoleBasedPermission]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        start_date = datetime.strptime(start, "%Y-%m-%d").date() if start else None
        end_date = datetime.strptime(end, "%Y-%m-%d").date() if end else None

        svc = FinancialReportService(start_date=start_date, end_date=end_date)
        summary = svc.summarize()
        serializer = FinancialSummarySerializer(summary)
        return Response(serializer.data)


@extend_schema(tags=["Reports"])
class FinancialInvoicesView(generics.ListAPIView):
    permission_classes = [RoleBasedPermission]
    pagination_class = CustomPagination
    serializer_class = InvoiceListSerializer

    def get_queryset(self):
        # Provide filters: lease_id, status, month
        qs = FinancialReportService().details()
        lease_id = self.request.query_params.get("lease_id")
        status_param = self.request.query_params.get("status")
        month = self.request.query_params.get("invoice_month")  # expected YYYY-MM-01 or YYYY-MM

        queryset = qs
        if lease_id:
            queryset = queryset.filter(lease_id=lease_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if month:
            # allow YYYY-MM or YYYY-MM-01
            if len(month) == 7:
                # convert to first day
                month_val = f"{month}-01"
            else:
                month_val = month
            queryset = queryset.filter(invoice_month=month_val)
        return queryset


@extend_schema(tags=["Reports"])
class OccupancySummaryView(APIView):
    permission_classes = [RoleBasedPermission]

    def get(self, request):
        svc = OccupancyReportService()
        data = svc.summarize()
        serializer = OccupancySummarySerializer(data)
        return Response(serializer.data)


@extend_schema(tags=["Reports"])
class VacantUnitsView(generics.ListAPIView):
    permission_classes = [RoleBasedPermission]
    serializer_class = UnitListSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        svc = OccupancyReportService()
        return svc.details_vacant()


@extend_schema(tags=["Reports"])
class RenterCollectionSummaryView(APIView):
    permission_classes = [RoleBasedPermission]

    def get(self, request):
        svc = RenterCollectionReportService()
        rows = svc.summarize()
        serializer = RenterCollectionRowSerializer(rows, many=True)
        return Response(serializer.data)


@extend_schema(tags=["Reports"])
class RenterTopDuesView(APIView):
    permission_classes = [RoleBasedPermission]

    def get(self, request):
        svc = RenterCollectionReportService()
        # Ensure your service uses select_related('user') to avoid N+1 issues
        qs = svc.top_dues(limit=int(request.query_params.get("limit", 20)))

        data = [
            {
                "renter_id": r.id,
                "full_name": r.full_name,
                "email": r.user.email,  # ✅ Updated: Accessing via User relationship
                "phone_number": r.phone_number,
                "total_due": getattr(r, "total_due", 0),
            }
            for r in qs
        ]
        return Response(data)
