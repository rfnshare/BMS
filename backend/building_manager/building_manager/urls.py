# building_manager/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path("admin/", admin.site.urls),
    path('api/', include("documents.urls")),
    path("api/accounts/", include("accounts.urls")),
    path('api/buildings/', include('buildings.urls')),
    path("api/", include("renters.urls")),
    path('api/', include('common.urls')),
]
