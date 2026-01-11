"""
WSGI config for building_manager project.
"""

import os
from django.core.wsgi import get_wsgi_application

# Do NOT hardcode dev/prod here
# This will use DJANGO_SETTINGS_MODULE from environment (.env / PM2 / shell)
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "building_manager.settings.base"
)

application = get_wsgi_application()
