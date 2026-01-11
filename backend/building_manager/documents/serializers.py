from rest_framework import serializers

from buildings.models import Unit
from documents.models import UnitDocument, RenterDocument, LeaseDocument
from common.validators import validate_file_size
from common.validators import validate_file_type


class UnitDocumentSerializer(serializers.ModelSerializer):
    unit = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all(), required=False)
    class Meta:
        model = UnitDocument
        fields = ['id', 'unit', 'doc_type', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate_file(self, file):
        validate_file_size(file, max_size_mb=10)  # Max 10MB
        validate_file_type(file, allowed_types=["pdf", "jpg", "png"])
        return file


class RenterDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RenterDocument
        fields = ["id", "renter", "doc_type", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

class LeaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseDocument
        fields = ["id", "lease", "doc_type", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]