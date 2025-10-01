from rest_framework.routers import DefaultRouter
from .views import UnitDocumentViewSet, RenterDocumentViewSet

router = DefaultRouter()
router.register(r'unit-documents', UnitDocumentViewSet, basename='unit-document')
router.register(r"renter-documents", RenterDocumentViewSet, basename="renter-document")
urlpatterns = router.urls
