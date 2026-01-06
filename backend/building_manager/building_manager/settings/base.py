# building_manager/settings/base.py
import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv # Load .env (optional, useful for local dev) load_dotenv()
load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ============================
# CORE
# ============================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")

ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")
    if h.strip()
]
# Tell Django to trust the X-Forwarded-Host header sent by Nginx
USE_X_FORWARDED_HOST = True

# If you ever use HTTPS/SSL in the future, this is required
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# ============================
# APPLICATIONS
# ============================
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "rest_framework_simplejwt.token_blacklist",

    # Local
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
    "expenses",
]

# ============================
# MIDDLEWARE
# ============================
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
    "common.logging.APILoggingMiddleware",
]

CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "accept",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
ROOT_URLCONF = "building_manager.urls"
WSGI_APPLICATION = "building_manager.wsgi.application"

# ============================
# TEMPLATES
# ============================
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
            ],
        },
    }
]

# ============================
# DATABASE
# ============================
DB_ENGINE = os.getenv("DB_ENGINE", "django.db.backends.sqlite3")

if DB_ENGINE == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": os.getenv("POSTGRES_DB"),
            "USER": os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("POSTGRES_HOST"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }

# ============================
# AUTH
# ============================
AUTH_USER_MODEL = os.getenv("AUTH_USER_MODEL", "accounts.User")

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ============================
# I18N
# ============================
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TIME_ZONE", "Asia/Dhaka")
USE_I18N = True
USE_TZ = True

# ============================
# STATIC & MEDIA
# ============================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_FILE_STORAGE = os.getenv("DEFAULT_FILE_STORAGE", "django.core.files.storage.FileSystemStorage")
# ============================
# DRF / JWT
# ============================
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

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 60))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 7))),
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
# ============================
# CORS / CSRF
# ============================
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "False") == "True"
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]

# ============================
# EMAIL
# ============================
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@localhost")

# ============================
# SECURITY (DEFAULTS)
# ============================
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0

# ============================
# MISC
# ============================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000")
BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
FROM_EMAIL = os.environ.get("FROM_EMAIL")  # e.g., rfnshare@gmail.com
FROM_NAME = os.environ.get("FROM_NAME", "Building Manager")
BREVO_USE_ATTACHMENT_URL = True