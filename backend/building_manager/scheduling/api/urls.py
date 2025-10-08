# scheduling/api/urls.py
from django.urls import path
from scheduling.api.views import TaskLogListView, ManualInvoiceGenerationView, ManualRentReminderView, \
    ManualOverdueDetectionView

urlpatterns = [
    path("task-logs/", TaskLogListView.as_view(), name="tasklog-list"),
    path("manual-invoice/", ManualInvoiceGenerationView.as_view(), name="manual-invoice"),
    path("manual-reminder/", ManualRentReminderView.as_view(), name="manual-reminder"),
    path("manual-overdue/", ManualOverdueDetectionView.as_view(), name="manual-overdue"),
]

