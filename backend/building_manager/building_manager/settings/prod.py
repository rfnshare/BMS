from .base import *
import os
import dj_database_url

DEBUG = False

ALLOWED_HOSTS = [
    "bms.viewdns.net",
]

# ------------------
# Database (PROD)
# ------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }
# else:
# SQLite from base.py is used automatically

# ------------------
# Static files
# ------------------
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ------------------
# CORS (LOCKED)
# ------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://bms.viewdns.net",
]

# ------------------
# CSRF (HTTPS)
# ------------------
CSRF_TRUSTED_ORIGINS = [
    "https://bms.viewdns.net",
]

# ------------------
# Security (STRICT)
# ------------------
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
