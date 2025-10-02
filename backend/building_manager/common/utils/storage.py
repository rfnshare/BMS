import os
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
        f"lease_{instance.lease.id}",
        filename
    )
