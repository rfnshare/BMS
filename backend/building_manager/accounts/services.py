# building_manager/accounts/services.py
from django.core.mail import send_mail

def send_otp_whatsapp(phone, code):
    # TODO: implement Twilio WhatsApp or free sandbox
    print(f"[WhatsApp] OTP {code} sent to {phone}")

def send_otp_email(email, code):
    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {code}",
        from_email=None,
        recipient_list=[email],
    )
