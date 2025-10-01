# building_manager/buildings/models.py
from django.db import models


class Floor(models.Model):
    name = models.CharField(max_length=50, unique=True)
    number = models.IntegerField(help_text="Floor number (0 = Ground, 1 = 1st Floor, etc.)")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"{self.name} (Floor {self.number})"



class Unit(models.Model):
    UNIT_TYPES = [
        ("residential", "Residential"),
        ("shop", "Shop")
    ]
    STATUS_CHOICES = [
        ("vacant", "Vacant"),
        ("occupied", "Occupied"),
        ("maintenance", "Maintenance")
    ]

    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="units")
    name = models.CharField(max_length=50)
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    # Prepaid utilities
    prepaid_electricity_meter_no = models.CharField(max_length=50, blank=True, null=True)
    prepaid_electricity_old_meter_no = models.CharField(max_length=50, blank=True, null=True)
    prepaid_electricity_customer_no = models.CharField(max_length=50, blank=True, null=True)
    prepaid_gas_meter_customer_code = models.CharField(max_length=50, blank=True, null=True)
    prepaid_gas_meter_prepaid_code = models.CharField(max_length=50, blank=True, null=True)
    prepaid_gas_meter_no = models.CharField(max_length=50, blank=True, null=True)
    prepaid_gas_card_no = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
