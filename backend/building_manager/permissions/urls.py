# permissions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppPermissionViewSet

router = DefaultRouter()
router.register(r'app-permissions', AppPermissionViewSet, basename='app-permissions')

urlpatterns = [
    path('', include(router.urls)),
]
