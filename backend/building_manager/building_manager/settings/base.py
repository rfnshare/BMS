# building_manager/settings/base.py
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Load .env (optional, useful for local dev)
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Basics
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ("1", "true", "yes")

# Hosts
ALLOWED_HOSTS = [h.strip() for h in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if h.strip()]

# Installed apps
INSTALLED_APPS = [
    # Django contrib
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework_simplejwt.token_blacklist',

    # Third-party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "dj_database_url",

    # Local apps (fix paths)
    "accounts",
    "buildings",
    "renters",
    "leases",
    "invoices",
    "documents",
    "notifications",
    "common",
    "payments",
    "permissions",
    "scheduling",
    "complaints",
    "expenses"
]

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "common.logging.APILoggingMiddleware"
]

ROOT_URLCONF = "building_manager.urls"

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "building_manager.wsgi.application"

# Custom user model (defined in apps/accounts/models.py)
AUTH_USER_MODEL = os.getenv("AUTH_USER_MODEL", "accounts.User")

# Database (default: sqlite for quick local dev; override in dev/prod)
DB_ENGINE = os.getenv("DB_ENGINE", "django.db.backends.sqlite3")
if DB_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": str(BASE_DIR / "db.sqlite3"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": os.getenv("POSTGRES_DB", "building_db"),
            "USER": os.getenv("POSTGRES_USER", "postgres"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
            "HOST": os.getenv("POSTGRES_HOST", "db"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }

# Password validation (sane defaults)
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("DJANGO_TIME_ZONE", "Asia/Dhaka")
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static & media
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

# whitenoise storage for static files (works for simple deploys)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# File storage backend (set to S3 in prod via DEFAULT_FILE_STORAGE override)
DEFAULT_FILE_STORAGE = os.getenv("DEFAULT_FILE_STORAGE", "django.core.files.storage.FileSystemStorage")

# REST Framework + JWT auth (DRF + simplejwt)
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "common.pagination.CustomPagination",
    "PAGE_SIZE": int(os.getenv("DRF_PAGE_SIZE", 10)),
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema"
}
CSRF_TRUSTED_ORIGINS = [
    "http://103.190.130.68:81",
]
# Simple JWT: lifetimes configured via env
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 105))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 7))),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
SPECTACULAR_SETTINGS = {
    'TITLE': 'Building Management API',
    'DESCRIPTION': 'API documentation for Building Management System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {

        'deepLinking': True,
        'persistAuthorization': True,
    },
    'SORT_OPERATIONS': True,  # optional: sorts endpoints alphabetically
    'COMPONENT_SPLIT_REQUEST': True,  # better request/response in schema
    'TAGS': [
        {'name': 'Accounts', 'description': 'User and authentication endpoints'},
        [
            {'name': 'Floors',
             'description': 'Manage building floors including create, update, and delete operations.'},
            {'name': 'Units',
             'description': 'Manage residential or commercial units within floors, including status and rent details.'},
            {'name': 'Unit Documents',
             'description': 'Upload and manage documents related to individual units, such as meter scans.'},
            {'name': 'Renters',
             'description': 'Handle renter profiles, contact details, and identification documents.'},
        ]

    ]
}
# CORS
CORS_ALLOWED_ORIGINS = [u.strip() for u in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if u.strip()]
CORS_ALLOW_CREDENTIALS = True

# Celery (broker & backend)
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)

# Email (safe default for dev)
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@localhost")

# Security defaults (can be tightened in prod.py)
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0

# Misc
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
FROM_EMAIL = os.environ.get("FROM_EMAIL")  # e.g., rfnshare@gmail.com
FROM_NAME = os.environ.get("FROM_NAME", "Building Manager")
BREVO_USE_ATTACHMENT_URL = True
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000")

