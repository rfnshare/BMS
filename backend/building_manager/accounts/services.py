from django.core.mail import send_mail
from dotenv import load_dotenv
from twilio.rest import Client
import os

load_dotenv()
# Load from environment variables for security
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

def send_otp_whatsapp(phone, code):
    """
    Send OTP via WhatsApp using Twilio.
    phone: full phone number with country code, e.g., +8801XXXXXXXXX
    code: OTP code (integer or string)
    """
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"{code} is your verification code. For your security, do not share this code.",
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{phone}"
        )
        print(f"[WhatsApp] OTP {code} sent to {phone} (SID: {message.sid})")
    except Exception as e:
        print(f"[WhatsApp] Failed to send OTP to {phone}: {e}")

def send_otp_email(email, code):
    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {code}",
        from_email=None,
        recipient_list=[email],
    )
