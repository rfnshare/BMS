from django.core.mail import send_mail
from dotenv import load_dotenv
from twilio.rest import Client
import os
from notifications.utils import NotificationService
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
    """
    Send OTP via email using the NotificationService class.
    email: recipient's email address
    code: OTP code (integer or string)
    """
    subject = "Your OTP Code"
    message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2e6c80; font-size: 24px; font-weight: bold;">Dear User,</h2>
            <p style="font-size: 16px;">Your OTP code is <strong>{code}</strong>. For your security, please do not share this code.</p>
            <p style="font-size: 16px;">Best regards,<br> Building Manager - Saptaneer</p>
        </body>
    </html>
    """
    try:
        # Call the _send_email method from NotificationService
        NotificationService._send_email(
            to_email=email,
            subject=subject,
            content=message  # HTML formatted content
        )
        print(f"[Email] OTP {code} sent to {email} successfully.")
    except Exception as e:
        print(f"[Email] Failed to send OTP email to {email}: {e}")