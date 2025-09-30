# building_manager/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RenterOTP
from .services import send_otp_whatsapp, send_otp_email

@receiver(post_save, sender=RenterOTP)
def send_otp_on_create(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        if user.phone_number:
            send_otp_whatsapp(user.phone_number, instance.code)
        if user.email:
            send_otp_email(user.email, instance.code)
