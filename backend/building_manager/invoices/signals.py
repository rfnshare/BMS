import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone

from .models import Invoice
from .services import generate_invoice_pdf
from notifications.utils import NotificationService
from scheduling.api.views import get_email_message, get_whatsapp_message
# Import TaskLog locally inside the function to avoid potential circular imports
# from scheduling.models import TaskLog  <-- Moved inside receiver

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Invoice)
def invoice_post_save(sender, instance: Invoice, created, **kwargs):
    """
    Handle individual invoice creation:
    1. Automatically generate Invoice Number if missing.
    2. Create a TaskLog for audit and traceability.
    3. Generate PDF and send notifications synchronously.
    """
    # 1. Generate unique invoice number for new records
    if not instance.invoice_number:
        instance.invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{instance.pk}"
        instance.save(update_fields=["invoice_number"])

    instance.refresh_from_db()

    # 2. Guard Clauses
    if not created:
        logger.debug(f"Invoice {instance.id} updated, skipping auto-notify.")
        return

    # This flag prevents double-notifying when your bulk task is running
    if getattr(instance, "_skip_signal_notify", False):
        logger.debug(f"Invoice {instance.id} marked _skip_signal_notify, skipping.")
        return

    # 3. START THE TASK LOG (Traceability Parent)
    from scheduling.models import TaskLog
    renter = instance.lease.renter
    user = renter.user 

    task_log = TaskLog.objects.create(
        task_name="SIGNAL_INVOICE_NOTIFY",
        status="IN_PROGRESS",
        executed_by=user,
        message=f"Processing auto-notifications for Invoice {instance.invoice_number}"
    )

    try:
        # 4. SYNCHRONOUS PDF GENERATION
        logger.info(f"Invoice {instance.id}: generating PDF.")
        generate_invoice_pdf(instance)
        instance.refresh_from_db()

        # 5. CONSTRUCT ATTACHMENT URL
        attachment_url = None
        if instance.invoice_pdf and instance.invoice_pdf.url:
            site_url = getattr(settings, "SITE_URL", "").rstrip("/")
            attachment_url = f"{site_url}{instance.invoice_pdf.url}" if site_url else instance.invoice_pdf.url
        else:
            logger.warning(f"Invoice {instance.id}: No PDF found for attachment.")

        # 6. EMAIL NOTIFICATION
        if getattr(renter, "prefers_email", False) and renter.user.email:
            subject, body = get_email_message(instance, renter, message_type="invoice_created")
            NotificationService.send(
                notification_type="invoice_created",
                renter=renter,
                channel="email",
                subject=subject,
                message=body,
                invoice=instance,
                sent_by=user,
                attachment_url=attachment_url,
                task_log=task_log  # <--- LINKED FOR TRACEABILITY
            )

        # 7. WHATSAPP NOTIFICATION
        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            message = get_whatsapp_message(instance, renter, message_type="invoice_created")
            NotificationService.send(
                notification_type="invoice_created",
                renter=renter,
                channel="whatsapp",
                message=message,
                invoice=instance,
                sent_by=user,
                attachment_url=attachment_url,
                task_log=task_log  # <--- LINKED FOR TRACEABILITY
            )

        # 8. FINALIZE TASK LOG
        task_log.status = "SUCCESS"
        task_log.save()
        logger.info(f"Invoice {instance.id}: Auto-notify workflow completed successfully.")

    except Exception as exc:
        # 9. LOG FAILURE FOR AUDIT
        task_log.status = "FAILURE"
        task_log.message = f"Error: {str(exc)}"
        task_log.save()
        logger.exception(f"Invoice {instance.id} post_save auto-notify failed: {exc}")