from rest_framework import serializers
from documents.models import UnitDocument
from common.validators import validate_file_size
from common.validators import validate_file_type


class UnitDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitDocument
        fields = ['id', 'unit', 'doc_type', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate_file(self, file):
        validate_file_size(file, max_size_mb=10)  # Max 10MB
        validate_file_type(file, allowed_types=["pdf", "jpg", "png"])
        return file