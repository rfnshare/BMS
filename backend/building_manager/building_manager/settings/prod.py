from .base import *
import os
import dj_database_url

DEBUG = False

ALLOWED_HOSTS = [
    "bms.viewdns.net",
    "192.168.1.95",
    "localhost",
    "127.0.0.1",
]

# ------------------
# Database
# ------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
        )
    }

# ------------------
# Static files
# ------------------
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ------------------
# CORS
# ------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://bms.viewdns.net",
    "http://192.168.1.95",
    "http://192.168.1.95:8000",
]
CORS_ALLOW_CREDENTIALS = True

# ------------------
# CSRF (HTTP SAFE)
# ------------------
CSRF_TRUSTED_ORIGINS = [
    "http://bms.viewdns.net",
    "http://192.168.1.95",
    "http://192.168.1.95:8000",
]

CSRF_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = "Lax"

# ------------------
# Sessions (HTTP SAFE)
# ------------------
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"

# ------------------
# Security (NO HTTPS YET)
# ------------------
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = None

SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# SECURE_SSL_REDIRECT = True
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
