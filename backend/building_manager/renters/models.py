# building_manager/renters/models.py
from django.db import models
from common.models import BaseAuditModel
from accounts.models import User
from common.utils.storage import renter_profile_upload_path, renter_nid_upload_path


class Renter(BaseAuditModel):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    MARITAL_STATUS_CHOICES = [
        ("single", "Single"),
        ("married", "Married"),
        ("divorced", "Divorced"),
        ("widowed", "Widowed"),
    ]

    class NotificationPreference(models.TextChoices):
        NONE = "none", "None"
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"
        BOTH = "both", "Both"

    notification_preference = models.CharField(
        max_length=20,
        choices=NotificationPreference.choices,
        default=NotificationPreference.NONE,
        help_text="Select how this renter wants to receive notifications"
    )
    # Basic Info
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="renter_profile")
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, unique=True)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUS_CHOICES, default="single")
    spouse_name = models.CharField(max_length=255, blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)

    class Status(models.TextChoices):
        PROSPECTIVE = "prospective", "Prospective"
        ACTIVE = "active", "Active"
        FORMER = "former", "Former"
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PROSPECTIVE
    )

    # Address
    present_address = models.TextField()
    permanent_address = models.TextField()

    # Residence History (only last residence)
    previous_address = models.TextField(blank=True, null=True)
    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)
    landlord_name = models.CharField(max_length=255, blank=True, null=True)
    landlord_phone = models.CharField(max_length=20, blank=True, null=True)
    reason_for_leaving = models.TextField(blank=True, null=True)

    # Emergency & Occupation
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    relation = models.CharField(max_length=50, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=255, blank=True)
    office_address = models.TextField(blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    profile_pic = models.ImageField(upload_to=renter_profile_upload_path, blank=True, null=True)
    nid_scan = models.FileField(upload_to=renter_nid_upload_path, blank=True, null=True)

    # ----------------------------
    # Helper properties
    # ----------------------------
    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE

    @property
    def is_former(self):
        return self.status == self.Status.FORMER

    @property
    def prefers_email(self):
        return self.notification_preference in [self.NotificationPreference.EMAIL, self.NotificationPreference.BOTH]

    @property
    def prefers_whatsapp(self):
        return self.notification_preference in [self.NotificationPreference.WHATSAPP, self.NotificationPreference.BOTH]

    def __str__(self):
        return f"{self.full_name} ({self.user.username})"
