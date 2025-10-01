from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import UnitDocument
from .serializers import UnitDocumentSerializer
from permissions.custom_permissions import IsStaffOrReadOnlyForRenter

class UnitDocumentViewSet(viewsets.ModelViewSet):
    queryset = UnitDocument.objects.all()
    serializer_class = UnitDocumentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrReadOnlyForRenter]
