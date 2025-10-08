# notifications/api/urls.py
from django.urls import path
from notifications.api.views import NotificationListView

urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
]
