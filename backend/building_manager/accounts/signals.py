# building_manager/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RenterOTP
from .services import send_otp_whatsapp, send_otp_email

# accounts/signals.py (or similar file)
@receiver(post_save, sender=RenterOTP)
def send_otp_email_on_create(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance.user
    if user.email:
        # Call your email sending function
        send_otp_email(user.email, instance.code)
    else:
        # Optional: log or handle missing email
        print(f"OTP not sent: User {user.id} has no email.")

