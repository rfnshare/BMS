from django.db import models
from buildings.models import Unit
from common.models import BaseAuditModel
from renters.models import Renter


# Create your models here.
class UnitDocument(BaseAuditModel):
    DOC_TYPES = [
        ("electricity_meter", "Electricity Meter"),
        ("gas_meter", "Gas Meter"),
        ("other", "Other")
    ]

    unit = models.ForeignKey("buildings.Unit", related_name="documents", on_delete=models.CASCADE)
    file = models.FileField(upload_to="documents/units/%Y/%m/")
    doc_type = models.CharField(max_length=50, choices=DOC_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.unit.name} - {self.doc_type}"

class RenterDocument(models.Model):
    DOC_TYPES = [
        ("nid", "NID"),
        ("passport", "Passport"),
        ("other", "Other"),
    ]

    renter = models.ForeignKey(Renter, related_name="documents", on_delete=models.CASCADE)
    file = models.FileField(upload_to="documents/renters/%Y/%m/")
    doc_type = models.CharField(max_length=50, choices=DOC_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.renter.full_name} - {self.doc_type}"