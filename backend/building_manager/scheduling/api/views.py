# scheduling/api/views.py
from datetime import timedelta
from invoices.services import generate_invoice_pdf
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from common.pagination import CustomPagination
from invoices.models import Invoice
from leases.models import Lease
from notifications.utils import NotificationService
from permissions.drf import RoleBasedPermission
from scheduling.api.serializers import TaskLogSerializer
from scheduling.models import TaskLog


# -------------------------------
# Task Log List
# -------------------------------
@extend_schema(tags=["Scheduling"])
class TaskLogListView(generics.ListAPIView):
    queryset = TaskLog.objects.all()
    serializer_class = TaskLogSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = CustomPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["task_name", "status", "executed_by"]
    search_fields = ["task_name", "message", "executed_by__username"]
    ordering_fields = ["executed_at", "status"]
    ordering = ["-executed_at"]


# -------------------------------
# Helper function for formatted messages
# -------------------------------

def get_email_message(invoice, renter, message_type="invoice_created"):
    """
    Get a structured HTML message for email.
    """
    if message_type == "invoice_created":
        subject = f"Invoice #{invoice.invoice_number} - {invoice.description}"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #2e6c80;">Dear {renter.full_name},</h2>
                <p style="font-size: 16px;">We hope this email finds you well.</p>
                <p style="font-size: 16px;">Your monthly invoice <strong>#{invoice.invoice_number}</strong> has been successfully generated. Please find the details below:</p>
                <table style="font-size: 16px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Amount Due</th>
                        <td style="padding: 8px; text-align: left;">{invoice.amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Due Date</th>
                        <td style="padding: 8px; text-align: left;">{invoice.due_date.strftime('%B %d, %Y')}</td>
                    </tr>
                </table>
                <p style="font-size: 16px; margin-top: 20px;">Kindly ensure that the payment is made by the due date to avoid any penalties.</p>
                <p style="font-size: 16px;">If you have any questions or need assistance, please do not hesitate to contact us.</p>
                <p style="font-size: 16px;">Best regards,<br> Building Manager - Saptaneer<br>Contact us at: [8801521259370]</p>
            </body>
        </html>
        """
    elif message_type == "invoice_payment_update":
        subject = f"Payment Update for Invoice #{invoice.invoice_number}"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #2e6c80;">Dear {renter.full_name},</h2>
                <p style="font-size: 16px;">We have received a payment towards your invoice <strong>#{invoice.invoice_number}</strong>.</p>

                <table style="font-size: 16px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Invoice Description</th>
                        <td style="padding: 8px; text-align: left;">{invoice.description}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Total Amount</th>
                        <td style="padding: 8px; text-align: left;">{invoice.amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Paid Amount</th>
                        <td style="padding: 8px; text-align: left;">{invoice.paid_amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Remaining Balance</th>
                        <td style="padding: 8px; text-align: left;">{invoice.amount - invoice.paid_amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Payment Status</th>
                        <td style="padding: 8px; text-align: left; color: {'green' if invoice.status == 'paid' else '#d97706'};">
                            {invoice.status.replace('_', ' ').title()}
                        </td>
                    </tr>
                </table>

                <p style="font-size: 16px; margin-top: 20px;">An updated invoice PDF is attached for your reference.</p>

                <p style="font-size: 16px;">Thank you for your prompt payment and continued trust in us.</p>

                <p style="font-size: 16px;">Best regards,<br>
                Building Manager - Saptaneer<br>
                Contact us at: [8801521259370]</p>
            </body>
        </html>
        """
    elif message_type == "rent_reminder":
        subject = f"Reminder: Rent Due for Invoice #{invoice.invoice_number}"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #2e6c80;">Dear {renter.full_name},</h2>
                <p style="font-size: 16px;">We hope you are doing well.</p>
                <p style="font-size: 16px;">This is a friendly reminder that your rent payment for the following invoice is due soon:</p>
                <table style="font-size: 16px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Invoice Number</th>
                        <td style="padding: 8px; text-align: left;">#{invoice.invoice_number}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Amount Due</th>
                        <td style="padding: 8px; text-align: left;">{invoice.amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Due Date</th>
                        <td style="padding: 8px; text-align: left;">{invoice.due_date.strftime('%B %d, %Y')}</td>
                    </tr>
                </table>
                <p style="font-size: 16px; margin-top: 20px;">To avoid any late fees, kindly ensure the payment is made on or before the due date.</p>
                <p style="font-size: 16px;">If you need assistance or have any questions, please feel free to reach out to us.</p>
                <p style="font-size: 16px;">Best regards,<br> Building Manager - Saptaneer<br>Contact us at: [8801521259370]</p>
            </body>
        </html>
        """
    elif message_type == "overdue_notice":
        subject = f"Urgent: Overdue Invoice #{invoice.invoice_number}"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #b84e32;">Dear {renter.full_name},</h2>
                <p style="font-size: 16px;">We hope you are doing well.</p>
                <p style="font-size: 16px;">This is a gentle reminder that your invoice <strong>#{invoice.invoice_number}</strong> is now overdue. Below are the details:</p>
                <table style="font-size: 16px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; text-align: left;">Amount Due</th>
                        <td style="padding: 8px; text-align: left;">{invoice.amount} BDT</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Due Date</th>
                        <td style="padding: 8px; text-align: left;">{invoice.due_date.strftime('%B %d, %Y')}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; text-align: left;">Days Overdue</th>
                        <td style="padding: 8px; text-align: left;">{(timezone.now().date() - invoice.due_date).days} days</td>
                    </tr>
                </table>
                <p style="font-size: 16px; margin-top: 20px;">To avoid further complications or penalties, we kindly request that you settle the payment at your earliest convenience.</p>
                <p style="font-size: 16px;">If you require any assistance or need additional information, please don't hesitate to contact us.</p>
                <p style="font-size: 16px;">Best regards,<br> Building Manager - Saptaneer<br>Contact us at: [8801521259370]</p>
            </body>
        </html>
        """
    else:
        return ""

    return subject, body


def get_whatsapp_message(invoice, renter, message_type="invoice_created"):
    """
    Generate a compact WhatsApp message (no left padding or blank indentation).
    """
    contact_number = "[8801521259370]"  # Contact Number Placeholder

    if message_type == "invoice_created":
        return (
            f"Dear *{renter.full_name}*,\n\n"
            f"Your monthly invoice *#{invoice.invoice_number}* has been generated.\n"
            f"*Amount Due*: {invoice.amount:.2f} BDT\n"
            f"*Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n\n"
            "Please ensure payment is made by the due date to avoid penalties.\n"
            "If you have any questions, feel free to contact us.\n\n"
            "Best regards,\n"
            "Building Manager - Saptaneer\n"
            f"Contact: {contact_number}"
        )

    elif message_type == "rent_reminder":
        return (
            f"Dear *{renter.full_name}*,\n\n"
            f"Reminder: Your rent payment for invoice *#{invoice.invoice_number}* is due soon.\n"
            f"*Amount Due*: {invoice.amount:.2f} BDT\n"
            f"*Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n\n"
            "Kindly make payment before the due date to avoid late fees.\n"
            "If you need any assistance, please contact us.\n\n"
            "Best regards,\n"
            "Building Manager - Saptaneer\n"
            f"Contact: {contact_number}"
        )

    elif message_type == "overdue_notice":
        from django.utils import timezone
        days_overdue = (timezone.now().date() - invoice.due_date).days
        return (
            f"Dear *{renter.full_name}*,\n\n"
            f"Your invoice *#{invoice.invoice_number}* is now overdue.\n"
            f"*Amount Due*: {invoice.amount:.2f} BDT\n"
            f"*Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n"
            f"*Days Overdue*: {days_overdue} days\n\n"
            "Please settle the payment at your earliest convenience to avoid penalties.\n"
            "If you’ve already paid, please contact us immediately.\n\n"
            "Best regards,\n"
            "Building Manager - Saptaneer\n"
            f"Contact: {contact_number}"
        )
    elif message_type == "invoice_payment_update":
        return (
            f"Dear *{renter.full_name}*,\n\n"
            f"We’ve received your payment for invoice *#{invoice.invoice_number}*.\n\n"
            f"*Invoice Description*: {invoice.description}\n"
            f"*Total Amount*: {invoice.amount:.2f} BDT\n"
            f"*Paid Amount*: {invoice.paid_amount:.2f} BDT\n"
            f"*Remaining Balance*: {invoice.amount - invoice.paid_amount:.2f} BDT\n"
            f"*Payment Status*: {'✅ Paid' if invoice.status == 'paid' else '🟡 ' + invoice.status.replace('_', ' ').title()}\n\n"
            "An updated invoice PDF is available for your reference.\n\n"
            "Thank you for your prompt payment and continued trust in us.\n\n"
            "Best regards,\n"
            "Building Manager - Saptaneer\n"
            "Contact: [8801521259370]"
        )


    else:
        return ""


# -------------------------------
# Manual Invoice Generation
# -------------------------------

class ManualInvoiceGenerationView(APIView):
    """
    Create monthly invoices, generate PDFs, and notify renters with attachments.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request, *args, **kwargs):
        today = timezone.now().date()
        target_month_name = today.strftime('%B %Y')
        target_description = f"Monthly rent for {target_month_name}"
        current_month_start = today.replace(day=1)
        user = request.user

        # 1. START THE PARENT LOG
        task_log = TaskLog.objects.create(
            task_name="GENERATE_INVOICES",
            status="IN_PROGRESS",
            executed_by=user,
            message=f"Manual bulk generation started for {target_month_name}"
        )

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
                messages.append(f"SKIPPED LS-{lease.id}: Already exists.")
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

                # 5. Email Notification
                if renter.prefers_email and renter.user.email:
                    subject, body = get_email_message(invoice, renter, message_type="invoice_created")
                    NotificationService.send(
                        notification_type="invoice_created",
                        renter=renter,
                        channel="email",
                        subject=subject,
                        message=body,
                        invoice=invoice,
                        sent_by=user,
                        attachment_url=attachment_url,
                        task_log=task_log,  # Linked correctly
                    )

                # 6. WhatsApp Notification
                if renter.prefers_whatsapp and renter.phone_number:
                    wa_message = get_whatsapp_message(invoice, renter, message_type="invoice_created")
                    NotificationService.send(
                        notification_type="invoice_created",
                        renter=renter,
                        channel="whatsapp",
                        message=wa_message,
                        invoice=invoice,
                        sent_by=user,
                        attachment_url=attachment_url,
                        task_log=task_log,  # 🔥 FIXED: Now linked to the TaskLog
                    )

                created_count += 1
                messages.append(f"SUCCESS: LS-{lease.id} (Inv: {invoice.invoice_number})")

            except Exception as e:
                messages.append(f"ERROR LS-{lease.id}: {str(e)}")

        # 7. REFINED STATUS LOGIC
        if created_count > 0:
            task_log.status = "SUCCESS"
        elif skipped_count > 0 and created_count == 0:
            task_log.status = "SKIPPED"
        else:
            task_log.status = "FAILURE"

        task_log.message = f"Created: {created_count}, Skipped: {skipped_count}\n" + "\n".join(messages)[:800]
        task_log.save()

        return Response({
            "message": "Bulk processing completed.",
            "created": created_count,
            "skipped": skipped_count
        }, status=status.HTTP_200_OK)


# -------------------------------
# Manual Rent Reminder
# -------------------------------

@extend_schema(tags=["Scheduling"])
class ManualRentReminderView(APIView):
    """
    Manually send reminders for invoices due in the next 3 days.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request):
        user = request.user
        today = timezone.now().date()
        due_soon = today + timedelta(days=3)

        # 1. START THE PARENT LOG (Audit Trail Initialization)
        task_log = TaskLog.objects.create(
            task_name="RENT_REMINDER",
            status="IN_PROGRESS",
            executed_by=user,
            message=f"Manual rent reminder started for invoices due by {due_soon}"
        )

        invoices_due = Invoice.objects.filter(
            due_date__lte=due_soon,
            status__in=["draft", "unpaid", "partially_paid"]
        ).select_related('lease__renter__user')

        messages = []

        try:
            for invoice in invoices_due:
                renter = invoice.lease.renter

                # Email Notification
                if renter.prefers_email and renter.user.email:
                    subject, body = get_email_message(invoice, renter, message_type="rent_reminder")
                    NotificationService.send(
                        notification_type="rent_reminder",
                        renter=renter,
                        channel="email",
                        subject=subject,
                        message=body,
                        invoice=invoice,
                        task_log=task_log,  # <--- LINKED
                        sent_by=user
                    )

                # WhatsApp Notification
                if renter.prefers_whatsapp and renter.phone_number:
                    message = get_whatsapp_message(invoice, renter, message_type="rent_reminder")
                    NotificationService.send(
                        notification_type="rent_reminder",
                        renter=renter,
                        channel="whatsapp",
                        message=message,
                        invoice=invoice,
                        task_log=task_log,  # <--- FIXED: Linked this to TaskLog
                        sent_by=user
                    )

                messages.append(f"Reminder sent for invoice {invoice.invoice_number}")

            # 2. FINALIZE TASK LOG
            task_log.status = "SUCCESS" if invoices_due.exists() else "SKIPPED"
            task_log.message = f"Processed {len(invoices_due)} reminders.\n" + "\n".join(messages)[:800]
            task_log.save()

        except Exception as e:
            # 3. LOG FAILURE FOR AUDIT
            task_log.status = "FAILURE"
            task_log.message = f"Critical Error: {str(e)}"
            task_log.save()
            return Response({"detail": "Error during reminder processing."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "status": "success",
            "message": f"{len(invoices_due)} reminders processed",
            "details": messages
        }, status=status.HTTP_200_OK)


# -------------------------------
# Manual Overdue Detection
# -------------------------------
@extend_schema(tags=["Scheduling"])
class ManualOverdueDetectionView(APIView):
    """
    Detect overdue invoices (older than 30 days) and notify renters.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request):
        user = request.user
        today = timezone.now().date()
        # Invoices due 30+ days ago are considered "Long Overdue"
        overdue_threshold = today - timedelta(days=30)

        # 1. START THE PARENT LOG (Audit Trail)
        task_log = TaskLog.objects.create(
            task_name="OVERDUE_DETECTION",  # Fixed: Changed from RENT_REMINDER
            status="IN_PROGRESS",
            executed_by=user,
            message=f"Detecting invoices overdue since {overdue_threshold}"
        )

        try:
            # 2. FETCH OVERDUE INVOICES
            overdue_invoices = Invoice.objects.filter(
                due_date__lte=overdue_threshold,
                status__in=["unpaid", "partially_paid"]  # Drafts usually aren't sent as overdue
            ).select_related('lease__renter__user')

            if not overdue_invoices.exists():
                task_log.status = "SKIPPED"
                task_log.message = "No overdue invoices found for this threshold."
                task_log.save()
                return Response({"message": "No overdue invoices found."}, status=status.HTTP_200_OK)

            messages = []

            # 3. PROCESSING LOOP
            for invoice in overdue_invoices:
                try:
                    renter = invoice.lease.renter

                    # Email Notification
                    if renter.prefers_email and renter.user.email:
                        subject, body = get_email_message(invoice, renter, message_type="overdue_notice")
                        NotificationService.send(
                            notification_type="overdue_notice",
                            renter=renter,
                            channel="email",
                            subject=subject,
                            message=body,
                            invoice=invoice,
                            sent_by=user,
                            task_log=task_log,  # <--- LINKED
                        )

                    # WhatsApp Notification
                    if renter.prefers_whatsapp and renter.phone_number:
                        message = get_whatsapp_message(invoice, renter, message_type="overdue_notice")
                        NotificationService.send(
                            notification_type="overdue_notice",
                            renter=renter,
                            channel="whatsapp",
                            message=message,
                            invoice=invoice,
                            sent_by=user,
                            task_log=task_log  # <--- FIXED: Added missing link
                        )

                    messages.append(f"SUCCESS: Notice sent for {invoice.invoice_number}")

                except Exception as inner_e:
                    messages.append(f"FAILED: {invoice.invoice_number} error: {str(inner_e)}")

            # 4. FINALIZE TASK LOG
            # Status logic: If any individual item failed, we mark as SUCCESS_WITH_ERRORS or FAILURE
            has_failures = any("FAILED" in m for m in messages)
            task_log.status = "FAILURE" if has_failures else "SUCCESS"
            task_log.message = f"Processed {len(overdue_invoices)} overdue notices.\n" + "\n".join(messages)[:800]
            task_log.save()

            return Response({
                "status": "success",
                "message": f"{len(overdue_invoices)} overdue notices processed",
                "details": messages
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # 5. CRITICAL ERROR CATCH
            task_log.status = "FAILURE"
            task_log.message = f"Critical Error in View: {str(e)}"
            task_log.save()
            return Response({"detail": "Internal server error during detection."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
