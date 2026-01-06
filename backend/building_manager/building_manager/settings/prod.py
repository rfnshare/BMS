from .base import *
import os
import dj_database_url

# DEBUG = False
#
# ALLOWED_HOSTS = ["bms.viewdns.net"]

# ------------------
# Database
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

# ------------------
# Static files
# ------------------
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# # ------------------
# # CORS
# # ------------------
# CORS_ALLOW_ALL_ORIGINS = False
# CORS_ALLOWED_ORIGINS = ["https://bms.viewdns.net"]
# CORS_ALLOW_CREDENTIALS = True
#
# # ------------------
# # CSRF
# # ------------------
# CSRF_TRUSTED_ORIGINS = ["https://bms.viewdns.net"]
# CSRF_COOKIE_SECURE = True
# CSRF_COOKIE_SAMESITE = "Lax"

# ------------------
# Sessions
# ------------------
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"

# ------------------
# Security
# ------------------
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
