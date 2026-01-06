# building_manager/settings/prod.py
from .base import *
import dj_database_url
import os

DEBUG = True

ALLOWED_HOSTS = [
    "bms.viewdns.net",
    "localhost",
    "127.0.0.1",
]

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://bms.viewdns.net",
]

CSRF_TRUSTED_ORIGINS = [
    "http://bms.viewdns.net",
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = False  # turn True after HTTPS

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
