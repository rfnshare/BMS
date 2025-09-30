# building_manager/settings/dev.py
from .base import *

# Development settings
DEBUG = True
ALLOWED_HOSTS = ["*"]

# SQLite is already default in base.py, so usually no override needed.
# But if you want Postgres in dev, override here.

# Email (console backend for dev)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Show all CORS (useful during API frontend dev)
CORS_ALLOW_ALL_ORIGINS = True

# Security (loose for dev)
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0

# Logging (verbose for dev)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}
