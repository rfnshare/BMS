from rest_framework import serializers

from documents.models import UnitDocument


class UnitDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitDocument
        fields = ['id', 'unit', 'doc_type', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'unit']