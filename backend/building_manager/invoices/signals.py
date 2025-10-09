# invoices/signals.py
import logging
import pprint
from reportlab.lib.styles import getSampleStyleSheet
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone
from rest_framework import request

from scheduling.api.views import get_email_message, get_whatsapp_message
from .models import Invoice
from .services import generate_invoice_pdf
from notifications.utils import NotificationService

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, instance: Invoice, created, **kwargs):
    """
    Automatically generate PDF and send notifications on invoice creation.
    If CELERY_ENABLED is True, delegate to Celery task; otherwise run synchronously.
    """
    if not instance.invoice_number:
        instance.invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{instance.pk}"
        instance.save(update_fields=["invoice_number"])

        # refresh to get updated invoice_number
    instance.refresh_from_db()
    if not created:
        logger.debug(f"Invoice {instance.id} updated, skipping auto-notify.")
        return

    if getattr(instance, "_skip_signal_notify", False):
        logger.debug(f"Invoice {instance.id} marked _skip_signal_notify, skipping auto-notify.")
        return

    logger.info(f"Invoice {instance.id} created: starting PDF generation & notifications.")

    try:
        # -----------------------
        # CELERY ASYNC TASK
        # -----------------------
        if getattr(settings, "CELERY_ENABLED", False):
            from scheduling.tasks import generate_invoice_pdf_task
            generate_invoice_pdf_task.delay(instance.id)
            logger.info(f"Invoice {instance.id}: delegated PDF generation & notification to Celery task.")
            return

        # -----------------------
        # SYNCHRONOUS PDF GENERATION
        # -----------------------
        logger.info(f"Invoice instance fields:\n{pprint.pformat(vars(instance))}")
        logger.info(f"Invoice {instance.id}: generating PDF synchronously.")
        pdf_url = generate_invoice_pdf(instance)

        # Refresh from DB to get correct invoice_number and PDF URL
        instance.refresh_from_db()
        logger.info(f"Invoice {instance.id}: refreshed from DB. invoice_number={instance.invoice_number}, pdf_url={instance.invoice_pdf.url if instance.invoice_pdf else 'None'}")

        renter = instance.lease.renter
        user = renter.user  # system-generated notifications

        # -----------------------
        # VALID ATTACHMENT URL
        # -----------------------
        attachment_url = None
        if instance.invoice_pdf and instance.invoice_pdf.url:
            attachment_url = instance.invoice_pdf.url
            # Ensure full public URL
            if not attachment_url.startswith("http"):
                site_url = getattr(settings, "SITE_URL", "").rstrip("/")
                if site_url:
                    attachment_url = f"{site_url}{attachment_url}"
                    logger.info(f"Invoice {instance.id}: attachment URL set to {attachment_url}")
                else:
                    logger.warning(f"Invoice {instance.id}: SITE_URL not configured, attachment may not work in Brevo/WhatsApp")
        else:
            logger.warning(f"Invoice {instance.id}: PDF not found, skipping attachment.")

        # -----------------------
        # EMAIL NOTIFICATION
        # -----------------------
        if getattr(renter, "prefers_email", False) and renter.email:
            subject, body = get_email_message(instance, renter, message_type="invoice_created")
            notif = NotificationService.send(
                notification_type="invoice_created",
                renter=renter,
                channel="email",
                subject=subject,
                message=body,
                invoice=instance,
                sent_by=user,
                attachment_url=attachment_url
            )
            logger.info(f"Invoice {instance.id}: email sent to {renter.email}. Status: {notif.status}, Error: {notif.error_message}")

        # -----------------------
        # WHATSAPP NOTIFICATION
        # -----------------------
        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            message = get_whatsapp_message(instance, renter, message_type="invoice_created")
            notif = NotificationService.send(
                notification_type="invoice_created",
                renter=renter,
                channel="whatsapp",
                message=message,
                invoice=instance,
                sent_by=user,
                attachment_url=attachment_url
            )
            logger.info(f"Invoice {instance.id}: WhatsApp sent to {renter.phone_number}. Status: {notif.status}, Error: {notif.error_message}")

    except Exception as exc:
        logger.exception(f"Invoice {instance.id} post_save auto-PDF/send failed: {exc}")
