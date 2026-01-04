# building_manager/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [

    path("admin/", admin.site.urls),
    path('api/documents/', include("documents.urls")),
    path("api/accounts/", include("accounts.urls")),
    path('api/buildings/', include('buildings.urls')),
    path("api/renters/", include("renters.urls")),
    path('api/common/', include('common.urls')),
    path("api/leases/", include("leases.urls")),
    # Invoices
    path("api/invoices/", include("invoices.urls")),
    # Payments
    path("api/payments/", include("payments.urls")),
    path('api/permissions/', include('permissions.urls')),
    path("api/scheduling/", include("scheduling.api.urls")),
    path("api/notifications/", include("notifications.api.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/complaints/", include("complaints.urls")),
    path("api/expenses/", include("expenses.urls")),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)