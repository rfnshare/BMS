from rest_framework.routers import DefaultRouter
from .views import LeaseViewSet, LeaseRentHistoryViewSet, RentTypeViewSet

router = DefaultRouter()
router.register(r'leases', LeaseViewSet, basename='lease')
router.register(r'lease-rent-history', LeaseRentHistoryViewSet, basename='lease-rent-history')
router.register(r'rent-types', RentTypeViewSet, basename='rent-types')

urlpatterns = router.urls
