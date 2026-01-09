# scheduling/tasks.py
from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from leases.models import Lease
from invoices.models import Invoice
from invoices.services import generate_invoice_pdf
from notifications.utils import NotificationService
from scheduling.models import TaskLog
from scheduling.api.views import get_email_message, get_whatsapp_message

User = get_user_model()


@shared_task(name="generate_monthly_invoices_task") # Use the simple name seen by the worker
def generate_monthly_invoices_task(executed_by_id=None):
    """
    Automated version of the manual-invoice logic.
    """
    today = timezone.now().date()
    target_month_name = today.strftime('%B %Y')
    target_description = f"Monthly rent for {target_month_name}"
    current_month_start = today.replace(day=1)

    # If triggered by schedule, we might not have a user ID.
    # We find a staff/admin user for the log.
    executed_by = None
    if executed_by_id:
        executed_by = User.objects.filter(id=executed_by_id).first()
    else:
        executed_by = User.objects.filter(is_superuser=True).first()

    created_count = 0
    skipped_count = 0
    messages = []

    active_leases = Lease.objects.filter(status="active").select_related('renter__user')

    for lease in active_leases:
        renter = lease.renter

        if Invoice.objects.filter(
                lease=lease,
                invoice_type="rent",
                invoice_month=current_month_start
        ).exists():
            skipped_count += 1
            continue

        try:
            due_date = current_month_start + timedelta(days=7)
            invoice = Invoice(
                lease=lease,
                invoice_type="rent",
                amount=lease.rent_amount,
                due_date=due_date,
                invoice_month=current_month_start,
                status="unpaid",
                description=target_description
            )
            invoice._skip_signal_notify = True
            invoice.save()

            generate_invoice_pdf(invoice)
            invoice.refresh_from_db()

            attachment_url = None
            if invoice.invoice_pdf:
                site_url = getattr(settings, "SITE_URL", "http://localhost:8000").rstrip("/")
                attachment_url = f"{site_url}{invoice.invoice_pdf.url}"

            # Email
            if renter.prefers_email and renter.user.email:
                subject, body = get_email_message(invoice, renter, message_type="invoice_created")
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="email",
                    subject=subject,
                    message=body,
                    invoice=invoice,
                    sent_by=executed_by,
                    attachment_url=attachment_url
                )

            # WhatsApp
            if renter.prefers_whatsapp:
                wa_message = get_whatsapp_message(invoice, renter, message_type="invoice_created")
                NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="whatsapp",
                    message=wa_message,
                    invoice=invoice,
                    sent_by=executed_by,
                    attachment_url=attachment_url
                )

            created_count += 1
            messages.append(f"Success: LS-{lease.id}")

        except Exception as e:
            messages.append(f"Error LS-{lease.id}: {str(e)}")

    # Log the Task Result
    TaskLog.objects.create(
        task_name="AUTO_GENERATE_INVOICES",
        status="SUCCESS" if created_count > 0 else "SKIPPED",
        executed_by=executed_by,
        message=f"Created: {created_count}, Skipped: {skipped_count}\n" + "\n".join(messages)[:900]
    )

    return f"Processed {created_count} invoices."