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
SESSION_COOKIE_SECURE = False  # Change to False
SESSION_COOKIE_SAMESITE = "Lax"

# ------------------
# Security
# ------------------
SECURE_SSL_REDIRECT = False    # Change to False (Stops the auto-redirect)
SECURE_PROXY_SSL_HEADER = None # Set to None since no proxy/SSL

# Set HSTS to 0 to tell the browser to stop forcing HTTPS
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False