# reports/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("financial/summary/", views.FinancialSummaryView.as_view(), name="reports-financial-summary"),
    path("financial/invoices/", views.FinancialInvoicesView.as_view(), name="reports-financial-invoices"),
    path("occupancy/summary/", views.OccupancySummaryView.as_view(), name="reports-occupancy-summary"),
    path("occupancy/vacant/", views.VacantUnitsView.as_view(), name="reports-occupancy-vacant"),
    path("renter/collection/", views.RenterCollectionSummaryView.as_view(), name="reports-renter-collection"),
    path("renter/top-dues/", views.RenterTopDuesView.as_view(), name="reports-renter-top-dues"),
]
