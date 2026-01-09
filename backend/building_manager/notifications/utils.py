# notifications/utils.py
import base64
import os

from django.conf import settings
from sib_api_v3_sdk import ApiClient, TransactionalEmailsApi, SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException

from notifications.models import Notification


class NotificationService:
    """
    Centralized notification dispatcher.
    Supports Email (Brevo) and WhatsApp (pywhatkit – dev only).
    """

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
            task_log=None, **kwargs
    ):
        recipient = renter.user.email if channel == "email" else renter.phone_number

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
            task_log=task_log,
            **kwargs
        )

        try:
            if channel == "email":
                attachment_path = None
                if invoice and getattr(invoice, "invoice_pdf", None):
                    attachment_path = invoice.invoice_pdf.path

                NotificationService._send_email(
                    to_email=recipient,
                    subject=subject,
                    content=message,
                    attachment_path=attachment_path,
                )

                notification.status = "sent"

            elif channel == "whatsapp":
                full_msg = message.strip()
                if attachment_url:
                    full_msg += f"\n\nDownload: {attachment_url.strip()}"

                result = NotificationService._send_whatsapp(
                    renter.phone_number, full_msg
                )
                notification.status = result["status"]
                notification.error_message = result.get("error_message")

            else:
                notification.status = "failed"
                notification.error_message = f"Unsupported channel: {channel}"

        except Exception as e:
            notification.status = "failed"
            notification.error_message = str(e)

        notification.save()
        return notification

    # -------------------------
    # EMAIL (Brevo / SendinBlue)
    # -------------------------
    @staticmethod
    def _send_email(to_email, subject, content, attachment_path=None):
        configuration = ApiClient()
        configuration.configuration.api_key["api-key"] = os.getenv("BREVO_API_KEY")

        api_instance = TransactionalEmailsApi(configuration)

        attachments = []
        if attachment_path:
            try:
                with open(attachment_path, "rb") as f:
                    attachments.append(
                        {
                            "content": base64.b64encode(f.read()).decode("utf-8"),
                            "name": os.path.basename(attachment_path),
                        }
                    )
            except Exception as e:
                print("Attachment load failed:", e)

        email = SendSmtpEmail(
            sender={"name": settings.FROM_NAME, "email": settings.FROM_EMAIL},
            to=[{"email": to_email}],
            subject=subject,
            html_content=content,
            attachment=attachments if attachments else None,
        )

        try:
            api_instance.send_transac_email(email)
        except ApiException as e:
            raise Exception(f"Email send failed: {e}")

    # -------------------------
    # WHATSAPP (DEV / DESKTOP)
    # -------------------------
    @staticmethod
    def _send_whatsapp(to_number, message):
        """
        WhatsApp sending via pywhatkit.
        Disabled automatically on headless servers.
        """

        # 🚨 HARD STOP ON HEADLESS SERVER
        if not os.environ.get("DISPLAY"):
            return {
                "status": "failed",
                "error_message": "WhatsApp disabled (no DISPLAY on server)",
            }

        try:
            # Lazy import (CRITICAL FIX)
            from pywhatkit import sendwhatmsg_instantly
        except Exception as e:
            return {
                "status": "failed",
                "error_message": f"pywhatkit import failed: {e}",
            }

        # Ensure +880 format
        formatted_number = to_number
        if not formatted_number.startswith("+"):
            formatted_number = f"+88{to_number}"

        try:
            sendwhatmsg_instantly(formatted_number, message)
            return {"status": "sent", "error_message": None}

        except Exception as e:
            return {"status": "failed", "error_message": str(e)}
