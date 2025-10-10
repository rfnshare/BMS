from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.db.models.functions import Coalesce
from renters.models import Renter
from .base_report import BaseReportService


class RenterCollectionReportService(BaseReportService):
    def summarize(self):
        qs = (
            Renter.objects
            .annotate(
                total_invoiced=Coalesce(
                    Sum("leases__invoices__amount"),
                    0,
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
                total_paid=Coalesce(
                    Sum("leases__invoices__paid_amount"),
                    0,
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
            )
            .annotate(
                total_due=ExpressionWrapper(
                    F("total_invoiced") - F("total_paid"),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                )
            )
        )

        rows = []
        for r in qs:
            rows.append({
                "renter_id": r.id,
                "full_name": r.full_name,
                "email": r.email,
                "phone_number": r.phone_number,
                "total_invoiced": r.total_invoiced or 0,
                "total_paid": r.total_paid or 0,
                "total_due": r.total_due or 0,
            })
        return rows

    def top_dues(self, limit=20):
        qs = (
            Renter.objects
            .annotate(
                total_invoiced=Coalesce(
                    Sum("leases__invoices__amount"),
                    0,
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
                total_paid=Coalesce(
                    Sum("leases__invoices__paid_amount"),
                    0,
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
            )
            .annotate(
                total_due=ExpressionWrapper(
                    F("total_invoiced") - F("total_paid"),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                )
            )
            .order_by("-total_due")
        )
        return qs.filter(total_due__gt=0)[:limit]
