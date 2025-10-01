from django.core.exceptions import ValidationError

def validate_file_size(file, max_size_mb=5):
    """Validate that file size does not exceed max_size_mb"""
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Maximum file size is {max_size_mb} MB")

def validate_file_type(file, allowed_types=None):
    """Validate that file extension is allowed"""
    if allowed_types is None:
        allowed_types = ["pdf", "jpg", "jpeg", "png"]
    ext = file.name.split('.')[-1].lower()
    if ext not in allowed_types:
        raise ValidationError(f"Unsupported file type. Allowed types: {', '.join(allowed_types)}")
