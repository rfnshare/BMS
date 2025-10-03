from rest_framework import serializers

from documents.serializers import LeaseDocumentSerializer
from .models import Lease, LeaseRentHistory

class LeaseRentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaseRentHistory
        fields = ["id", "old_rent", "new_rent", "effective_date", "remarks", "created_at"]


class LeaseSerializer(serializers.ModelSerializer):
    documents = LeaseDocumentSerializer(many=True, read_only=True)
    rent_history = LeaseRentHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Lease
        fields = [
            "id", "renter", "unit", "start_date", "end_date", "termination_date",
            "rent_amount", "security_deposit", "deposit_status", "status",
            "electricity_card_given", "gas_card_given", "main_gate_key_given",
            "pocket_gate_key_given", "agreement_paper_given", "police_verification_done",
            "other_docs_given", "remarks", "documents", "rent_history", "agreement_file", "police_verification_file",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
