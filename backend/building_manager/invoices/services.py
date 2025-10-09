import io
import os
from decimal import Decimal
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from reportlab.lib import colors, styles
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from invoices.models import Invoice
from payments.models import Payment

# -----------------------------
# Helpers
# -----------------------------
DEFAULT_FONT = 'Helvetica'


def currency(value):
    """Format decimal/float as currency string with 2 decimals and thousands separator."""
    if value is None:
        value = Decimal('0.00')
    if not isinstance(value, Decimal):
        try:
            value = Decimal(value)
        except Exception:
            value = Decimal('0.00')
    return f"{value:,.2f}"


def _header_footer(canvas_obj, doc, unit_name=None):
    """Draw page number and optional footer info."""
    canvas_obj.saveState()
    width, height = A4
    title = unit_name or 'Building Manager'
    canvas_obj.setFont('Helvetica-Bold', 12)
    canvas_obj.drawCentredString(width / 2.0, height - 40, title)
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.drawRightString(width - doc.rightMargin, 20, f"Page {canvas_obj.getPageNumber()}")
    canvas_obj.restoreState()


def generate_invoice_pdf(invoice):
    """
    Generate PDF for an Invoice using related Lease, Renter, Unit, and Floor data.
    Returns the saved file path.
    """
    lease = invoice.lease
    renter = lease.renter
    unit = lease.unit
    floor = unit.floor if unit else None

    # Totals
    total_amount = Decimal(invoice.amount or 0)
    paid_amount = Decimal(invoice.paid_amount or 0)
    remaining_amount = max(total_amount - paid_amount, 0)

    # Status
    if paid_amount >= total_amount:
        payment_status = "Paid"
    elif paid_amount > 0:
        payment_status = "Partially Paid"
    else:
        payment_status = "Unpaid"

    # PDF save path
    folder_path = os.path.join(
        settings.MEDIA_ROOT,
        "documents",
        "invoices",
        str(invoice.invoice_date.year),
        f"{invoice.invoice_date.month:02}",
        f"invoice_id_{invoice.id}"
    )
    os.makedirs(folder_path, exist_ok=True)

    filename = f"Invoice-{invoice.invoice_number or invoice.id}.pdf"
    file_path = os.path.join(folder_path, filename)

    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=50, rightMargin=50, topMargin=70, bottomMargin=40
    )
    story = []

    # -------------------------------
    # HEADER (Building + Renter Info)
    # -------------------------------
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="NormalSmall", fontSize=9, leading=11))
    styles.add(ParagraphStyle(name="HeadingSmall", fontSize=10, leading=12, spaceAfter=4, spaceBefore=4))
    styles.add(ParagraphStyle(name="InvoiceTitle", fontSize=16, leading=18, spaceAfter=8, alignment=1))
    building_name = f"{floor.name if floor else ''} / {unit.name if unit else ''}"
    header_data = [
        [
            Paragraph(f"<b>Invoice Number:</b> {invoice.invoice_number}", styles["NormalSmall"]),
            Paragraph(f"<b>Date:</b> {invoice.invoice_date}", styles["NormalSmall"])
        ],
        [
            Paragraph(f"<b>Building Unit:</b> {building_name}", styles["NormalSmall"]),
            Paragraph(f"<b>Billing Month:</b> {invoice.invoice_month.strftime('%B %Y') if invoice.invoice_month else '-'}", styles["NormalSmall"])
        ],
        [
            Paragraph(f"<b>Renter:</b> {renter.full_name}", styles["NormalSmall"]),
            Paragraph(f"<b>Phone:</b> {renter.phone_number}", styles["NormalSmall"])
        ],
        [
            Paragraph(f"<b>Email:</b> {renter.email or '-'}", styles["NormalSmall"]),
            Paragraph(f"<b>Status:</b> {payment_status}", styles["NormalSmall"])
        ],
    ]

    header_table = Table(header_data, colWidths=[250, 250])
    header_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.2, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(Paragraph("<b>INVOICE</b>", styles["InvoiceTitle"]))
    story.append(header_table)
    story.append(Spacer(1, 15))

    # -------------------------------
    # CHARGES
    # -------------------------------
    charge_table_data = [
        [Paragraph("<b>Description</b>", styles["HeadingSmall"]),
         Paragraph("<b>Amount (BDT)</b>", styles["HeadingSmall"])],
        [Paragraph("Invoice Amount", styles["NormalSmall"]),
         Paragraph(f"{currency(invoice.amount)}", styles["NormalSmall"])],
        [Paragraph("Paid Amount", styles["NormalSmall"]),
         Paragraph(f"{currency(invoice.paid_amount)}", styles["NormalSmall"])],
        [Paragraph("<b>Balance Due</b>", styles["NormalSmall"]),
         Paragraph(f"<b>{currency(remaining_amount)}</b>", styles["NormalSmall"])],
    ]

    charge_table = Table(charge_table_data, colWidths=[370, 130])
    charge_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.2, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f5f5f5")),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
    ]))
    story.append(charge_table)
    story.append(Spacer(1, 15))

    # -------------------------------
    # NOTES
    # -------------------------------
    status_note = {
        "paid": "This invoice is fully paid.",
        "partially_paid": f"Partial payment received. Remaining due: {currency(remaining_amount)} BDT.",
        "unpaid": f"This invoice is unpaid. Total due: {currency(remaining_amount)} BDT.",
    }.get(invoice.status, "Invoice generated.")

    bullet_notes = [
        "Please pay the rent within 10th of the current month.",
        "Electricity and gas are prepaid; utilities are not included in the rent and will be borne by the renter.",
        "Subletting is not allowed.",
        "No modifications to the unit are allowed without owner's permission.",
        "Any damage caused by the renter must be repaired by the renter.",
        "Security deposit is refundable if rent has been continuously paid until leaving.",
        "Ensure your own safety in the unit; the building owner is not responsible for any event."
    ]

    all_notes = [status_note] + [f"• {n}" for n in bullet_notes]
    note_text = "<br/>".join(all_notes)
    notes_table = Table(
        [[Paragraph(note_text, ParagraphStyle(name="Notes", fontSize=9, leading=12))]],
        colWidths=[500],
        style=[
            ("BOX", (0, 0), (-1, -1), 0.3, colors.grey),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f9f9f9")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
    story.append(notes_table)
    story.append(Spacer(1, 20))

    # -------------------------------
    # SIGNATURE
    # -------------------------------
    signature_tbl = Table(
        [[Paragraph("<b>Authorized Signature</b>", styles["NormalSmall"])], [""]],
        colWidths=[200],
    )
    signature_tbl.setStyle(TableStyle([
        ("LINEABOVE", (0, 1), (0, 1), 0.5, colors.black),
        ("TOPPADDING", (0, 1), (0, 1), 10),
    ]))
    story.append(signature_tbl)

    # Build & save
    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()

    with open(file_path, "wb") as f:
        f.write(pdf_data)

    # Save to model
    relative_path = os.path.relpath(file_path, settings.MEDIA_ROOT)
    invoice.invoice_pdf.name = relative_path
    invoice.save(update_fields=["invoice_pdf"])

    return file_path


def apply_bulk_payment(lease, amount, method="cash", transaction_reference=None, notes=None):
    """
    Allocate a payment amount to all unpaid/partially paid invoices of a lease (oldest first).
    Returns:
        - List of Payment objects created
        - List of allocation details per invoice: {invoice_id, amount_applied, new_status}
    """
    if amount <= 0:
        raise ValueError("Payment amount must be positive.")

    from django.db.models import Q

    invoices = Invoice.objects.filter(
        lease=lease
    ).exclude(
        Q(status="paid") | Q(invoice_type__in=["security_deposit", "adjustment"])
    ).order_by("invoice_date", "id")
    # chronological order

    payments_created = []
    allocation = []
    remaining_amount = Decimal(amount)

    with transaction.atomic():
        for invoice in invoices:
            if remaining_amount <= 0:
                break

            invoice_balance = invoice.amount - invoice.paid_amount
            if invoice_balance <= 0:
                continue

            pay_amount = min(invoice_balance, remaining_amount)

            payment = Payment.objects.create(
                invoice=invoice,
                lease=lease,
                amount=pay_amount,
                method=method,
                transaction_reference=transaction_reference,
                notes=notes or "",
            )
            payments_created.append(payment)

            # Update invoice paid_amount and status
            invoice.paid_amount += pay_amount
            if invoice.paid_amount >= invoice.amount:
                invoice.status = "paid"
            else:
                invoice.status = "partially_paid"
            invoice.save(update_fields=["paid_amount", "status"])

            # Update lease deposit status if security deposit invoice fully paid
            if invoice.invoice_type == "security_deposit" and lease.deposit_status != "paid":
                lease.deposit_status = "paid"
                lease.save(update_fields=["deposit_status"])

            allocation.append({
                "invoice_id": invoice.id,
                "amount_applied": str(pay_amount),
                "status": invoice.status
            })

            remaining_amount -= pay_amount

    return payments_created, allocation
