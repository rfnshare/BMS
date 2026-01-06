# building_manager/settings/dev.py
from .base import *
import os

# =====================================================
# STATIC FILES
# =====================================================
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# =====================================================
# SECURITY (DISABLED IN DEV)
# =====================================================
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
