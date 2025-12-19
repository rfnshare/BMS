import os

from django.utils.text import slugify
from django.utils.timezone import now


def unit_document_upload_path(instance, filename):
    """
    Generate dynamic path for unit documents
    Example: documents/units/2025/10/unit_5/filename.pdf
    """
    return os.path.join(
        "documents",
        "units",
        now().strftime("%Y/%m"),
        f"unit_{instance.unit.id}",
        filename,
    )

def renter_profile_upload_path(instance, filename):
    """
    Example: documents/renters/profile_pics/2025/10/user_3.png
    """
    return os.path.join(
        "documents",
        "renters",
        "profile_pics",
        now().strftime("%Y/%m"),
        f"user_{instance.user.id}",
        filename
    )


def renter_nid_upload_path(instance, filename):
    """
    Example: documents/renters/nid_scans/2025/10/user_3.pdf
    """
    return os.path.join(
        "documents",
        "renters",
        "nid_scans",
        now().strftime("%Y/%m"),
        f"user_{instance.user.id}",
        filename
    )

def lease_document_upload_path(instance, filename):
    """
    Example: documents/leases/2025/10/lease_5/filename.pdf
    """
    from django.utils.timezone import now
    return os.path.join(
        "documents",
        "leases",
        now().strftime("%Y/%m"),
        f"lease_{instance.id}",
        filename
    )

def invoice_pdf_upload_path(instance, filename):
    """
    Example:
      documents/invoices/2025/10/invoice_INV-20251003-84/invoice_INV-20251003-84.pdf
    """
    invoice_key = getattr(instance, "invoice_number", None) or f"id_{instance.id}"
    return os.path.join(
        "documents",
        "invoices",
        now().strftime("%Y/%m"),
        f"invoice_{invoice_key}",
        filename
    )

def expense_attachment_upload_path(instance, filename):
    """
    Generate dynamic path for expense attachments.
    Example:
      - For lease-related expense:
        documents/expenses/2025/10/lease_12/receipt_AC_Repair.pdf
      - For general expense:
        documents/expenses/2025/10/general/maintenance_bill.pdf
    """
    from django.utils.timezone import now

    # 1. Base path: documents/expenses/YYYY/MM
    base_path = os.path.join(
        "documents",
        "expenses",
        now().strftime("%Y/%m"),
    )

    # 2. Subfolder based on LEASE (Fix: Changed from renter to lease)
    if instance.lease:
        # Using lease ID keeps files organized by contract
        subfolder = f"lease_{instance.lease.id}"
    else:
        subfolder = "general"

    # 3. Optional: Sanitize filename to prevent issues
    name, ext = os.path.splitext(filename)
    clean_filename = f"{slugify(name)}{ext}"

    return os.path.join(base_path, subfolder, clean_filename)


def complaint_attachment_upload_path(instance, filename):
    """
    Path: documents/complaints/2025/10/lease_12/broken_window.jpg
    """
    from django.utils.timezone import now
    import os
    from django.utils.text import slugify

    base_path = os.path.join("documents", "complaints", now().strftime("%Y/%m"))

    # Organize by Lease ID if available
    if instance.lease:
        subfolder = f"lease_{instance.lease.id}"
    else:
        subfolder = "general"

    name, ext = os.path.splitext(filename)
    clean_filename = f"{slugify(name)}{ext}"

    return os.path.join(base_path, subfolder, clean_filename)