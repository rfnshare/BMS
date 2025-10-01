# building_manager/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from documents.views import UnitDocumentViewSet

router = DefaultRouter()
router.register(r'unit-documents', UnitDocumentViewSet, basename='unit-document')
urlpatterns = [

    path("admin/", admin.site.urls),
    path('api/', include(router.urls)),
    path("api/accounts/", include("accounts.urls")),
    path('api/buildings/', include('buildings.urls')),
    path('api/', include('common.urls')),
]
