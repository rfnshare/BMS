# building_manager/renters/urls.py
from rest_framework.routers import DefaultRouter
from .views import RenterViewSet

router = DefaultRouter()
router.register(r"renters", RenterViewSet, basename="renter")

urlpatterns = router.urls
