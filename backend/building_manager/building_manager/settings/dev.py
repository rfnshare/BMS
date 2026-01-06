# building_manager/settings/dev.py
from .base import *
import os

# =====================================================
# CORE
# =====================================================
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
]

# =====================================================
# DATABASE (DEV)
# =====================================================
# Uses sqlite from base.py – no override needed

# =====================================================
# STATIC FILES
# =====================================================
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# =====================================================
# CORS (DEV – explicit, NOT allow all)
# =====================================================
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = True

# =====================================================
# CSRF (DEV)
# =====================================================
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# =====================================================
# SECURITY (DISABLED IN DEV)
# =====================================================
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
