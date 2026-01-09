import logging
from decimal import Decimal
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework import request

from invoices.services import generate_invoice_pdf
from notifications.utils import NotificationService
from payments.models import Payment
from leases.models import Lease
from scheduling.api.views import get_email_message, get_whatsapp_message
from scheduling.models import TaskLog

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Payment)
def update_invoice_and_lease(sender, instance: Payment, created, **kwargs):
    if not created:
        return

    # 1. START THE TASK LOG (Traceability Parent)
    # Get the user who executed the payment or fallback to the renter's user
    executed_by = getattr(instance, '_executed_by', None) or instance.lease.renter.user

    task_log = TaskLog.objects.create(
        task_name="PAYMENT_RECEIVED_NOTIFICATION",
        status="IN_PROGRESS",
        executed_by=executed_by,
        message=f"Processing payment {instance.id} for lease {instance.lease_id}"
    )

    try:
        payment_amount = Decimal(instance.amount or 0)
        lease = instance.lease if instance.lease else (instance.invoice.lease if instance.invoice else None)

        if not lease:
            task_log.status = "FAILURE"
            task_log.message = "Payment has no linked lease or invoice."
            task_log.save()
            return

        # SINGLE-INVOICE Logic
        if instance.invoice_id:
            invoice = instance.invoice
            balance = invoice.amount - invoice.paid_amount
            applied = min(balance, payment_amount)
            invoice.paid_amount += applied
            invoice.status = "paid" if invoice.paid_amount >= invoice.amount else "partially_paid"
            invoice.save(update_fields=["paid_amount", "status"])

            if invoice.invoice_type == "security_deposit" and invoice.status == "paid":
                lease.deposit_status = "paid"
                lease.save(update_fields=["deposit_status"])

            # Pass task_log to the helper
            notify_single_invoice(invoice, task_log=task_log)

            task_log.status = "SUCCESS"
            task_log.message = f"Applied payment to Invoice {invoice.invoice_number}"
            task_log.save()
            return

        # BULK PAYMENT Logic
        invoices = lease.invoices.filter(status__in=["unpaid", "partially_paid"]).exclude(
            invoice_type__in=["security_deposit", "adjustment"]
        ).order_by("invoice_date", "id")

        updated_invoices = []
        for inv in invoices:
            if payment_amount <= 0: break
            balance = inv.amount - inv.paid_amount
            if balance <= 0: continue

            applied = min(balance, payment_amount)
            inv.paid_amount += applied
            payment_amount -= applied
            inv.status = "paid" if inv.paid_amount >= inv.amount else "partially_paid"
            inv.save(update_fields=["paid_amount", "status"])
            updated_invoices.append(inv)

        if updated_invoices:
            # Pass task_log to the helper
            send_bulk_payment_summary(updated_invoices, task_log=task_log)

        task_log.status = "SUCCESS"
        task_log.message = f"Bulk payment applied to {len(updated_invoices)} invoices."
        task_log.save()

    except Exception as e:
        task_log.status = "FAILURE"
        task_log.message = f"Error processing payment: {str(e)}"
        task_log.save()
        logger.exception(f"Payment signal error: {e}")


# -------------------------
# Helpers
# -------------------------
def notify_single_invoice(invoice, task_log=None): # Added task_log param
    renter = invoice.lease.renter
    user = getattr(renter, "user", None)

    try:
        generate_invoice_pdf(invoice)
        attachment_url = _get_attachment_url(invoice.invoice_pdf.url if invoice.invoice_pdf else None)

        if getattr(renter, "prefers_email", False) and renter.user.email:
            subject, body = get_email_message(invoice, renter, "invoice_payment_update")
            NotificationService.send(
                notification_type="invoice_payment_update",
                renter=renter,
                channel="email",
                subject=subject,
                message=body,
                invoice=invoice,
                sent_by=user,
                attachment_url=attachment_url,
                task_log=task_log,  # <--- LINKED!
            )

        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            message = get_whatsapp_message(invoice, renter, "invoice_payment_update")
            NotificationService.send(
                notification_type="invoice_payment_update",
                renter=renter,
                channel="whatsapp",
                message=message,
                invoice=invoice,
                sent_by=user,
                attachment_url=attachment_url,
                task_log=task_log # <--- LINKED!
            )
    except Exception as e:
        logger.exception(f"Failed to notify: {e}")


def send_bulk_payment_summary(invoices, task_log=None ):
    renter = invoices[0].lease.renter
    user = getattr(renter, "user", None)

    total_amount = sum(inv.amount for inv in invoices)
    total_paid = sum(inv.paid_amount for inv in invoices)

    summary_rows = "".join(
        f"<tr>"
        f"<td>{inv.invoice_number}</td>"
        f"<td>{inv.description or '-'}</td>"
        f"<td>{inv.amount:.2f}</td>"
        f"<td>{inv.paid_amount:.2f}</td>"
        f"<td>{inv.status.title()}</td>"
        f"</tr>"
        for inv in invoices
    )

    email_body = f"""
    <html>
        <body>
            <h3>Dear {renter.full_name},</h3>
            <p>Your bulk payment has been applied. The following invoices are updated:</p>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Invoice No</th>
                        <th>Description</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>{summary_rows}</tbody>
            </table>
            <p>Total Amount: {total_amount:.2f} BDT</p>
            <p>Total Paid: {total_paid:.2f} BDT</p>
            <p>Thank you for your timely payment.</p>
        </body>
    </html>
    """

    whatsapp_message = (
        f"Dear {renter.full_name}, your payment has been received for {len(invoices)} invoices.\n"
        + "\n".join([f"- {inv.invoice_number}: {inv.status.title()} ({inv.paid_amount:.2f} BDT)" for inv in invoices])
    )

    try:
        if getattr(renter, "prefers_email", False) and renter.email:
            NotificationService.send(
                notification_type="bulk_payment_update",
                renter=renter,
                channel="email",
                subject=f"Payment Update - {len(invoices)} Invoices Updated",
                message=email_body,
                sent_by=user,
                task_log=task_log,  # <--- LINKED!
            )

        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            NotificationService.send(
                notification_type="bulk_payment_update",
                renter=renter,
                channel="whatsapp",
                message=whatsapp_message,
                sent_by=user,
                task_log=task_log  # <--- LINKED!
            )
    except Exception as e:
        logger.exception(f"Failed to send bulk summary: {e}")


def _get_attachment_url(pdf_url):
    if not pdf_url:
        return None
    if pdf_url.startswith("http"):
        return pdf_url
    site_url = getattr(settings, "SITE_URL", "").rstrip("/")
    return f"{site_url}{pdf_url}" if site_url else None
