from django.db import models
from buildings.models import Unit


# Create your models here.
class UnitDocument(models.Model):
    DOC_TYPES = [
        ("electricity_meter", "Electricity Meter"),
        ("gas_meter", "Gas Meter"),
        ("other", "Other")
    ]

    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="documents/units/%Y/%m/")
    doc_type = models.CharField(max_length=50, choices=DOC_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.unit.name} - {self.doc_type}"