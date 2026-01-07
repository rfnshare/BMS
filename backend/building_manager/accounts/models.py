# building_manager/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random

from common.models import BaseAuditModel
from common.utils.storage import staff_profile_upload_path


class User(AbstractUser):
    # Roles
    is_superadmin = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)
    is_renter = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # For WhatsApp login
    profile_picture = models.ImageField(
        upload_to=staff_profile_upload_path,  # 👈 Using the new function
        null=True,
        blank=True
    )
    bio = models.TextField(max_length=500, blank=True)
    email = models.EmailField(unique=True)
    def __str__(self):
        return self.username


class RenterOTP(BaseAuditModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"is_renter": True})
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @staticmethod
    def generate_otp(user):
        code = f"{random.randint(100000, 999999)}"
        valid_until = timezone.now() + timedelta(minutes=5)
        otp = RenterOTP.objects.create(user=user, code=code, valid_until=valid_until)
        return otp

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.valid_until
