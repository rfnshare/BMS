# reports/services/occupancy_service.py
from django.db.models import Count
from buildings.models import Unit
from leases.models import Lease
from .base_report import BaseReportService


class OccupancyReportService(BaseReportService):
    def summarize(self):
        total_units = Unit.objects.count()
        occupied_units = Unit.objects.filter(status="occupied").count()
        vacant_units = Unit.objects.filter(status="vacant").count()
        maintenance_units = Unit.objects.filter(status="maintenance").count()

        # Optional: leases starting/ending in the date range
        active_leases = Lease.objects.filter(status="active").count()
        upcoming_ends = Lease.objects.filter(end_date__range=(self.start_date, self.end_date)).count()

        occupancy_rate = round((occupied_units / total_units) * 100.0, 2) if total_units else 0

        return {
            "total_units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": vacant_units,
            "maintenance_units": maintenance_units,
            "occupancy_rate": occupancy_rate,
            "active_leases": active_leases,
            "leases_ending_in_period": upcoming_ends,
        }

    def details_vacant(self, limit=100):
        """Return vacuum unit queryset for drilldown."""
        return Unit.objects.filter(status="vacant").select_related("floor")[:limit]
