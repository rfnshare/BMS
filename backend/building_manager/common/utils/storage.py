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
