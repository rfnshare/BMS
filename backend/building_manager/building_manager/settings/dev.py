from .base import *
import os

DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

# ------------------
# CORS (DEV = OPEN)
# ------------------
CORS_ALLOW_ALL_ORIGINS = True

# ------------------
# CSRF (DEV)
# ------------------
CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://bms.viewdns.net:81",
]

# ------------------
# Security (DEV)
# ------------------
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False

# ------------------
# Email (DEV)
# ------------------
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
