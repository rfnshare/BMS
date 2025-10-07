from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import TaskLog
from .serializers import TaskLogSerializer
from .tasks import generate_monthly_invoices

class TaskLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaskLog.objects.all()
    serializer_class = TaskLogSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def run_monthly_invoices(self, request):
        generate_monthly_invoices.delay()
        return Response({"status": "Task queued"}, status=status.HTTP_202_ACCEPTED)
