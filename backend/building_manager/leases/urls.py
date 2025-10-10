from rest_framework.routers import DefaultRouter
from .views import LeaseViewSet, LeaseRentHistoryViewSet

router = DefaultRouter()
router.register(r'', LeaseViewSet, basename='lease')
router.register(r'lease-rent-history', LeaseRentHistoryViewSet, basename='lease-rent-history')

urlpatterns = router.urls
