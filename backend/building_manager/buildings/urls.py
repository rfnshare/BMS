# building_manager/buildings/urls.py
from rest_framework.routers import DefaultRouter

from .views import FloorViewSet, UnitViewSet

router = DefaultRouter()
router.register(r"floors", FloorViewSet, basename="floor")
router.register(r"units", UnitViewSet, basename="unit")

urlpatterns = router.urls
