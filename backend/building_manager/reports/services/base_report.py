# reports/services/base_report.py
from datetime import date
from typing import Optional

class BaseReportService:
    """
    Base report service that other report services should extend.
    Exposes start_date/end_date defaults and a small helper interface.
    """
    def __init__(self, start_date: Optional[date] = None, end_date: Optional[date] = None):
        today = date.today()
        self.start_date = start_date or today.replace(day=1)
        self.end_date = end_date or today

    def summarize(self):
        """Return aggregate summary (dict)."""
        raise NotImplementedError()

    def details(self, *args, **kwargs):
        """Return detailed rows for drill-down (iterable/queryset/serializable)."""
        raise NotImplementedError()
