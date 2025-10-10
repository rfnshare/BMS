# reports/services/financial_service.py
from decimal import Decimal
from django.db.models import Sum, Count, F, Value as V
from django.db.models.functions import Coalesce
from invoices.models import Invoice
from payments.models import Payment
from .base_report import BaseReportService


class FinancialReportService(BaseReportService):
    def summarize(self):
        invoices = Invoice.objects.filter(invoice_date__range=(self.start_date, self.end_date))
        payments = Payment.objects.filter(payment_date__range=(self.start_date, self.end_date))

        total_invoiced = invoices.aggregate(total=Coalesce(Sum("amount"), Decimal("0.00")))["total"]
        total_collected = payments.aggregate(total=Coalesce(Sum("amount"), Decimal("0.00")))["total"]

        # outstanding = sum of (amount - paid_amount) for invoices in date range (include adjustments etc)
        outstanding_qs = invoices.annotate(due=F("amount") - F("paid_amount"))
        total_outstanding = outstanding_qs.aggregate(total=Coalesce(Sum("due"), Decimal("0.00")))["total"]

        status_counts = invoices.values("status").annotate(count=Count("id"))

        return {
            "start_date": self.start_date,
            "end_date": self.end_date,
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "total_outstanding": total_outstanding,
            "invoice_count": invoices.count(),
            "payment_count": payments.count(),
            "invoice_status_counts": list(status_counts),
        }

    def details(self, lease_id=None, limit=100):
        """
        Return invoice-level detail rows (QuerySet) for drilldowns.
        Optional filter by lease_id.
        """
        qs = Invoice.objects.select_related("lease", "lease__renter", "lease__unit").order_by("-invoice_date", "-id")
        if lease_id:
            qs = qs.filter(lease_id=lease_id)
        return qs[:limit]
