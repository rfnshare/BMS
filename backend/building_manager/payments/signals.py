import logging
from decimal import Decimal
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from invoices.services import generate_invoice_pdf
from notifications.utils import NotificationService
from payments.models import Payment
from leases.models import Lease
from scheduling.api.views import get_email_message, get_whatsapp_message

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Payment)
def update_invoice_and_lease(sender, instance: Payment, created, **kwargs):
    """
    Handle payments:
    - Single invoice: regenerate PDF + send email/WhatsApp
    - Bulk (lease-wide) payment: update invoices + send one summary email/WhatsApp
    """
    if not created:
        return

    payment_amount = Decimal(instance.amount or 0)
    lease: Lease = instance.lease if instance.lease else (instance.invoice.lease if instance.invoice else None)
    if not lease:
        logger.warning(f"Payment {instance.id} has no linked lease or invoice.")
        return

    # -------------------------
    # SINGLE-INVOICE payment
    # -------------------------
    if instance.invoice_id:
        invoice = instance.invoice
        balance = invoice.amount - invoice.paid_amount
        applied = min(balance, payment_amount)
        invoice.paid_amount += applied
        payment_amount -= applied

        invoice.status = "paid" if invoice.paid_amount >= invoice.amount else "partially_paid"
        invoice.save(update_fields=["paid_amount", "status"])

        # Update lease deposit_status if security deposit
        if invoice.invoice_type == "security_deposit" and invoice.status == "paid" and lease.deposit_status != "paid":
            lease.deposit_status = "paid"
            lease.save(update_fields=["deposit_status"])

        # Notify renter with PDF
        notify_single_invoice(invoice)
        return

    # -------------------------
    # BULK PAYMENT (no invoice linked)
    # -------------------------
    invoices = lease.invoices.filter(
        status__in=["unpaid", "partially_paid"]
    ).exclude(invoice_type__in=["security_deposit", "adjustment"]).order_by("invoice_date", "id")

    # Inside bulk payment block
    updated_invoices = []
    for inv in invoices:
        if payment_amount <= 0:
            break
        balance = inv.amount - inv.paid_amount
        if balance <= 0:
            continue

        applied = min(balance, payment_amount)
        inv.paid_amount += applied
        payment_amount -= applied
        inv.status = "paid" if inv.paid_amount >= inv.amount else "partially_paid"
        inv.save(update_fields=["paid_amount", "status"])
        updated_invoices.append(inv)

    # Instead of calling notify_invoices(updated_invoices)
    # call a bulk summary function
    if updated_invoices:
        send_bulk_payment_summary(updated_invoices)  # No PDF, just one summary email/WhatsApp


# -------------------------
# Helpers
# -------------------------
def notify_single_invoice(invoice):
    renter = invoice.lease.renter
    user = getattr(renter, "user", None)

    try:
        logger.info(f"Regenerating PDF for Invoice {invoice.id}.")
        generate_invoice_pdf(invoice)

        attachment_url = _get_attachment_url(invoice.invoice_pdf.url if invoice.invoice_pdf else None)

        # Email
        if getattr(renter, "prefers_email", False) and renter.email:
            subject, body = get_email_message(invoice, renter, "invoice_payment_update")
            NotificationService.send(
                notification_type="invoice_payment_update",
                renter=renter,
                channel="email",
                subject=subject,
                message=body,
                invoice=invoice,
                sent_by=user,
                attachment_url=attachment_url
            )

        # WhatsApp
        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            message = get_whatsapp_message(invoice, renter, "invoice_payment_update")
            NotificationService.send(
                notification_type="invoice_payment_update",
                renter=renter,
                channel="whatsapp",
                message=message,
                invoice=invoice,
                sent_by=user,
                attachment_url=attachment_url
            )

    except Exception as e:
        logger.exception(f"Failed to notify single invoice {invoice.id}: {e}")


def send_bulk_payment_summary(invoices):
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
        # Email
        if getattr(renter, "prefers_email", False) and renter.email:
            NotificationService.send(
                notification_type="bulk_payment_update",
                renter=renter,
                channel="email",
                subject=f"Payment Update - {len(invoices)} Invoices Updated",
                message=email_body,
                sent_by=user,
            )

        # WhatsApp
        if getattr(renter, "prefers_whatsapp", False) and renter.phone_number:
            NotificationService.send(
                notification_type="bulk_payment_update",
                renter=renter,
                channel="whatsapp",
                message=whatsapp_message,
                sent_by=user,
            )

    except Exception as e:
        logger.exception(f"Failed to send bulk payment summary: {e}")


def _get_attachment_url(pdf_url):
    if not pdf_url:
        return None
    if pdf_url.startswith("http"):
        return pdf_url
    site_url = getattr(settings, "SITE_URL", "").rstrip("/")
    return f"{site_url}{pdf_url}" if site_url else None
