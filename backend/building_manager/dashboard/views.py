# dashboard/api/views.py
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from permissions.drf import RoleBasedPermission
from scheduling.api.serializers import TaskLogSerializer  # if you need task log serializer elsewhere
from dashboard.services import get_dashboard_data


@extend_schema(tags=["Dashboard"])
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def get(self, request):
        """
        Returns dashboard summary data (KPIs, recent payments, top dues, aging, occupancy).
        """
        data = get_dashboard_data()
        return Response({
            "status": "success",
            "data": data
        })
