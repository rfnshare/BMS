# dashboard/services.py
from datetime import date
from decimal import Decimal

from django.db.models import F, Sum, Value, Case, When, DecimalField, ExpressionWrapper, DurationField
from django.db.models.functions import Coalesce, Now

from invoices.models import Invoice
from payments.models import Payment
from leases.models import Lease
from buildings.models import Unit


def _to_decimal_str(x):
    if x is None:
        return "0.00"
    return f"{Decimal(x):.2f}"


def get_dashboard_data():
    today = date.today()
    first_day_of_month = today.replace(day=1)

    # SUMMARY KPIS
    total_income_q = Payment.objects.aggregate(total=Coalesce(Sum("amount"), Value(Decimal("0.00"))))
    total_income = total_income_q["total"]

    # total due = sum(amount - paid_amount) for all invoices where amount > paid_amount
    invoices_with_balance = Invoice.objects.annotate(
        balance=F("amount") - F("paid_amount")
    ).filter(balance__gt=0)

    total_due_agg = invoices_with_balance.aggregate(total=Coalesce(Sum("balance", output_field=DecimalField()), Value(Decimal("0.00"))))
    total_due = total_due_agg["total"]

    active_renters = Lease.objects.filter(status="active").values("renter").distinct().count()
    total_invoices = Invoice.objects.count()

    # RENT COLLECTION PROGRESS FOR CURRENT MONTH
    monthly_billed = Invoice.objects.filter(invoice_date__gte=first_day_of_month).aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]
    monthly_collected = Payment.objects.filter(payment_date__gte=first_day_of_month).aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    progress_percent = 0
    try:
        if monthly_billed and Decimal(monthly_billed) > 0:
            progress_percent = (Decimal(monthly_collected) / Decimal(monthly_billed)) * 100
    except Exception:
        progress_percent = 0

    # RECENT PAYMENTS (last 10)
    recent_payments_qs = Payment.objects.select_related("invoice", "lease__renter", "lease__unit") \
        .order_by("-payment_date", "-id")[:10]

    recent_payments = []
    for p in recent_payments_qs:
        renter = getattr(p.lease, "renter", None) or getattr(p, "renter", None)
        unit = getattr(p.lease, "unit", None)
        recent_payments.append({
            "id": p.id,
            "payment_date": p.payment_date.isoformat(),
            "amount": _to_decimal_str(p.amount),
            "renter_name": renter.full_name if renter else None,
            "unit_name": unit.name if unit else None,
            "invoice_id": p.invoice_id,
            "method": p.method,
        })

    # TOP DUE RENTERS (by total outstanding)
    top_due = (
        Invoice.objects
        .values("lease__renter__id", "lease__renter__full_name")
        .annotate(total_due=Coalesce(Sum(F("amount") - F("paid_amount"), output_field=DecimalField()), Value(Decimal("0.00"))))
        .filter(total_due__gt=0)
        .order_by("-total_due")[:10]
    )

    top_due_list = []
    for row in top_due:
        renter_id = row["lease__renter__id"]
        renter_name = row["lease__renter__full_name"]
        total_due_val = row["total_due"] or Decimal("0.00")
        # gather units for this renter (distinct)
        units = list(
            Lease.objects.filter(renter_id=renter_id).select_related("unit")
            .values_list("unit__name", flat=True).distinct()
        )
        top_due_list.append({
            "renter_id": renter_id,
            "renter_name": renter_name,
            "units": units,
            "total_due": _to_decimal_str(total_due_val),
        })

    # AGING BUCKETS for unpaid/partially_paid invoices
    # compute balance per invoice and bucket by days overdue
    # aging_qs = Invoice.objects.filter(status__in=["unpaid", "partially_paid"]).annotate(
    #     age_days=ExpressionWrapper(Now() - F("invoice_date"), output_field=DurationField())
    # )

    # def _sum_case(condition):
    #     return Sum(
    #         Case(
    #             When(condition, then=F("amount") - F("paid_amount")),
    #             default=Value(Decimal("0.00")),
    #             output_field=DecimalField(),
    #         )
    #     )

    # aggregate using timedelta in days
    # aging = aging_qs.aggregate(
    #     days_0_30=_sum_case(When(age_days__lte=30 * 86400)),
    #     days_31_60=_sum_case(When(age_days__gt=30 * 86400, age_days__lte=60 * 86400)),
    #     days_61_90=_sum_case(When(age_days__gt=60 * 86400, age_days__lte=90 * 86400)),
    #     days_90_plus=_sum_case(When(age_days__gt=90 * 86400)),
    # )

    # OCCUPANCY
    total_units = Unit.objects.count()
    occupied_units = Lease.objects.filter(status="active").values("unit").distinct().count()
    vacant_units = max(total_units - occupied_units, 0)
    occupancy_percent = round((occupied_units / total_units * 100) if total_units else 0, 2)

    # build final payload (convert decimals to strings)
    data = {
        "summary": {
            "total_income": _to_decimal_str(total_income),
            "total_due": _to_decimal_str(total_due),
            "active_renters": active_renters,
            "total_invoices": total_invoices,
        },
        "rent_collection": {
            "billed": _to_decimal_str(monthly_billed),
            "collected": _to_decimal_str(monthly_collected),
            "progress_percent": round(progress_percent, 2),
        },
        "recent_payments": recent_payments,
        "top_due_renters": top_due_list,
        # "aging": {
        #     "days_0_30": _to_decimal_str(aging.get("days_0_30")),
        #     "days_31_60": _to_decimal_str(aging.get("days_31_60")),
        #     "days_61_90": _to_decimal_str(aging.get("days_61_90")),
        #     "days_90_plus": _to_decimal_str(aging.get("days_90_plus")),
        # },
        "occupancy": {
            "total_units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": vacant_units,
            "occupancy_percent": occupancy_percent,
        },
    }

    return data