# scheduling/api/views.py
from datetime import timedelta

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
    Get a structured and professional message for WhatsApp with rich text formatting.
    """
    contact_number = "[8801521259370]"  # Contact Number Placeholder

    if message_type == "invoice_created":
        return f"""
        Dear *{renter.full_name}*,\n
        Your monthly invoice *#{invoice.invoice_number}* has been generated.\n
        *Amount Due*: {invoice.amount} BDT\n
        *Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n
        Please ensure payment is made by the due date to avoid penalties.\n
        If you have any questions, feel free to contact us.\n\n
        Best regards,\n
        Building Manager - Saptaneer\n
        Contact: {contact_number}
        """

    elif message_type == "rent_reminder":
        return f"""
        Dear *{renter.full_name}*,\n
        Reminder: Your rent payment for invoice *#{invoice.invoice_number}* is due soon.\n
        *Amount Due*: {invoice.amount} BDT\n
        *Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n
        Kindly make payment before the due date to avoid late fees.\n
        If you need any assistance, please contact us.\n\n
        Best regards,\n
        Building Manager - Saptaneer\n
        Contact: {contact_number}
        """

    elif message_type == "overdue_notice":
        return f"""
        Dear *{renter.full_name}*,\n
        Your invoice *#{invoice.invoice_number}* is now overdue.\n
        *Amount Due*: {invoice.amount} BDT\n
        *Due Date*: {invoice.due_date.strftime('%B %d, %Y')}\n
        *Days Overdue*: {(timezone.now().date() - invoice.due_date).days} days\n
        Please settle the payment at your earliest convenience to avoid penalties.\n
        If you need assistance or have already paid, please contact us immediately.\n\n
        Best regards,\n
        Building Manager - Saptaneer\n
        Contact: {contact_number}
        """
    else:
        return ""

# -------------------------------
# Manual Invoice Generation
# -------------------------------

@extend_schema(tags=["Scheduling"])
class ManualInvoiceGenerationView(APIView):
    """

    Create monthly invoices and notify renters via email/WhatsApp.
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]

    def post(self, request, *args, **kwargs):
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        user = request.user
        notif_statuses = []
        created_count = 0
        skipped_count = 0
        messages = []

        active_leases = Lease.objects.filter(status="active")

        for lease in active_leases:
            renter = lease.renter

            if Invoice.objects.filter(lease=lease, invoice_type="rent", invoice_date__gte=current_month_start).exists():
                skipped_count += 1
                messages.append(f"Skipped lease {lease.id} — invoice exists")
                continue

            due_date = current_month_start + timedelta(days=7)
            invoice = Invoice(
                lease=lease,
                invoice_type="rent",
                amount=lease.rent_amount,
                due_date=due_date,
                status="unpaid",
                description=f"Monthly rent for {today.strftime('%B %Y')}"
            )
            invoice._skip_signal_notify = True  # mark in memory only
            invoice.save()

            created_count += 1
            messages.append(f"Created invoice {invoice.invoice_number or invoice.id} for lease {lease.id}")

            # -------------------
            # Send notifications
            # -------------------
            if renter.prefers_email:
                subject, body = get_email_message(invoice, renter, message_type="invoice_created")
                notif = NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="email",
                    subject=subject,
                    message=body,
                    invoice=invoice,
                    sent_by=user
                )
                notif_statuses.append(f"Email: {notif.status}")

            if renter.prefers_whatsapp:
                message = get_whatsapp_message(invoice, renter, message_type="invoice_created")
                notif = NotificationService.send(
                    notification_type="invoice_created",
                    renter=renter,
                    channel="whatsapp",
                    message=message,
                    invoice=invoice,
                    sent_by=user
                )
                notif_statuses.append(f"Whatsapp: {notif.status}")

        task_status = "FAILURE" if any("failed" in m.lower() for m in messages) else "SUCCESS"

        # Log Task
        TaskLog.objects.create(
            task_name="GENERATE_INVOICES",
            status=task_status,
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "message": "Manual invoice generation completed",
            "created": created_count,
            "skipped": skipped_count,
            "details": messages
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

        invoices_due = Invoice.objects.filter(
            due_date__lte=due_soon,
            status__in=["draft", "unpaid", "partially_paid"]
        )

        messages = []
        notif_statuses = []
        for invoice in invoices_due:
            renter = invoice.lease.renter

            if renter.prefers_email:
                subject, body = get_email_message(invoice, renter, message_type="rent_reminder")
                notif = NotificationService.send(
                    notification_type="rent_reminder",
                    renter=renter,
                    channel="email",
                    subject=subject,
                    message=body,
                    invoice=invoice,
                    sent_by=user
                )
                notif_statuses.append(f"Email: {notif.status}")

            if renter.prefers_whatsapp:
                message = get_whatsapp_message(invoice, renter, message_type="rent_reminder")
                notif = NotificationService.send(
                    notification_type="rent_reminder",
                    renter=renter,
                    channel="whatsapp",
                    message=message,
                    invoice=invoice,
                    sent_by=user
                )
                notif_statuses.append(f"Whatsapp: {notif.status}")

            messages.append(f"Reminder sent for invoice {invoice.invoice_number}")

        task_status = "FAILURE" if any("failed" in m.lower() for m in messages) else "SUCCESS"
        TaskLog.objects.create(
            task_name="RENT_REMINDER",
            status=task_status,
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

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
        overdue_threshold = today - timedelta(days=30)

        # Attempt to filter overdue invoices
        try:
            overdue_invoices = Invoice.objects.filter(
                due_date__lte=overdue_threshold,
                status__in=["draft", "unpaid", "partially_paid"]
            )
        except Exception as e:
            return Response({
                "status": "error",
                "message": "Internal server error",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        messages = []
        notif_statuses = []

        # Loop through overdue invoices and send notifications
        for invoice in overdue_invoices:
            try:
                renter = invoice.lease.renter
                if renter.prefers_email:
                    subject, body = get_email_message(invoice, renter, message_type="overdue_notice")
                    notif = NotificationService.send(
                        notification_type="overdue_notice",
                        renter=renter,
                        channel="email",
                        subject=subject,
                        message=body,
                        invoice=invoice,
                        sent_by=user
                    )
                    notif_statuses.append(f"Email: {notif.status}")

                if renter.prefers_whatsapp:
                    message = get_whatsapp_message(invoice, renter, message_type="overdue_notice")
                    notif = NotificationService.send(
                        notification_type="overdue_notice",
                        renter=renter,
                        channel="whatsapp",
                        message=message,
                        invoice=invoice,
                        sent_by=user
                    )
                    notif_statuses.append(f"Whatsapp: {notif.status}")

                messages.append(f"Overdue notice sent for invoice {invoice.invoice_number}")

            except Exception as e:
                messages.append(f"Failed to process invoice {invoice.invoice_number}: {str(e)}")

        # Determine task status based on whether any failures occurred
        if any("failed" in m.lower() for m in messages):
            task_status = "FAILURE"
        else:
            task_status = "SUCCESS"

        # Log Task
        TaskLog.objects.create(
            task_name="CUSTOM",
            status=task_status,
            executed_by=user,
            message="\n".join(messages)[:1000]
        )

        return Response({
            "status": "success",
            "message": f"{len(overdue_invoices)} overdue notices processed"
        }, status=status.HTTP_200_OK)
