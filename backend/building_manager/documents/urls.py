from rest_framework.routers import DefaultRouter
from .views import UnitDocumentViewSet

router = DefaultRouter()
router.register(r'unit-documents', UnitDocumentViewSet, basename='unit-document')

urlpatterns = router.urls
