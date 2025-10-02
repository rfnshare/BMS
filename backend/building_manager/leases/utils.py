from invoices.models import Invoice

def create_invoice(lease, amount, invoice_type, due_date, description=""):
    return Invoice.objects.create(
        lease=lease,
        amount=amount,
        invoice_type=invoice_type,
        due_date=due_date,
        status="unpaid",
        description=description
    )
