"""
WSGI config for building_manager project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "building_manager.settings.prod"
)

application = get_wsgi_application()