import os
from celery import Celery

# Replace 'building_manager.settings.dev' with your actual default settings path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'building_manager.settings.dev')

app = Celery('building_manager')

# We use 'CELERY' as a prefix for all celery-related settings in base.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically find tasks.py in your apps (like /invoices/tasks.py)
app.autodiscover_tasks()