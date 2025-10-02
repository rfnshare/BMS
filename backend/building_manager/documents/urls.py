from rest_framework.routers import DefaultRouter
from .views import UnitDocumentViewSet, RenterDocumentViewSet, LeaseDocumentViewSet

router = DefaultRouter()
router.register(r'unit-documents', UnitDocumentViewSet, basename='unit-document')
router.register(r"renter-documents", RenterDocumentViewSet, basename="renter-document")
router.register(r'lease-documents', LeaseDocumentViewSet, basename='lease-document')
urlpatterns = router.urls
