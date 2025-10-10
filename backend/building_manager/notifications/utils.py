# notifications/utils.py
import base64
import os
import pywhatkit as kit
import sib_api_v3_sdk
from django.conf import settings
from pywhatkit import sendwhatmsg_instantly

from notifications.models import Notification
from twilio.rest import Client
from sib_api_v3_sdk import ApiClient, TransactionalEmailsApi, SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException

class NotificationService:

    @staticmethod
    def send(
            notification_type,
            renter,
            channel,
            message,
            subject=None,
            invoice=None,
            sent_by=None,
            attachment_url=None,
    ):
        """
        Sends notification via email or WhatsApp, logs it in Notification model.
        Automatically handles attachments and message formatting.
        """
        recipient = renter.email if channel == "email" else renter.phone_number

        notification = Notification.objects.create(
            notification_type=notification_type,
            renter=renter,
            invoice=invoice,
            channel=channel,
            recipient=recipient,
            subject=subject,
            message=message,
            sent_by=sent_by,
            status="pending",

        )

        try:
            if channel == "email":
                # Attach invoice PDF if available
                attachment_path = None
                if invoice and getattr(invoice, "invoice_pdf", None):
                    attachment_path = invoice.invoice_pdf.path
                NotificationService._send_email(recipient, subject, message, attachment_path)

            elif channel == "whatsapp":
                # Append download link if provided
                full_msg = message.strip()
                if attachment_url:
                    full_msg += f"\n\nDownload: {attachment_url.strip()}"

                result = NotificationService._send_whatsapp(renter.phone_number, full_msg)
                notification.status = result.get("status", "failed")
                notification.error_message = result.get("error_message", "")

            else:
                notification.status = "failed"
                notification.error_message = f"Unsupported channel: {channel}"

        except Exception as e:
            notification.status = "failed"
            notification.error_message = str(e)

        notification.save()
        return notification

    @staticmethod
    def _send_email(to_email, subject, content, attachment_path=None):
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")
        api_instance = TransactionalEmailsApi(ApiClient(configuration))

        # Prepare attachments if provided
        attachments = []
        if attachment_path:
            try:
                with open(attachment_path, "rb") as f:
                    file_data = f.read()
                attachments = [
                    {
                        "content": base64.b64encode(file_data).decode("utf-8"),
                        "name": os.path.basename(attachment_path)
                    }
                ]
            except Exception as e:
                print("Attachment load failed:", e)

        send_smtp_email = SendSmtpEmail(
            sender={"name": settings.FROM_NAME, "email": settings.FROM_EMAIL},
            to=[{"email": to_email}],
            subject=subject,
            html_content=content,
            attachment=attachments if attachments else None,
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
        except ApiException as e:
            raise Exception(f"Email send failed: {e}")

    @staticmethod
    def _send_whatsapp(to_number, message):
        from_number = os.getenv("WHATSAPP_FROM")  # Use centralized config
        if not from_number:
            raise ValueError("WHATSAPP_FROM is not set in .env")

        # Ensure proper format: +880XXXXXXXXXX
        formatted_number = to_number
        if not formatted_number.startswith("+"):
            formatted_number = f"+88{to_number}"

        try:
            sendwhatmsg_instantly(formatted_number, message)
            return {"status": "sent", "error_message": None}

        except Exception as e:
            return {"status": "failed", "error_message":
                str(e)}

