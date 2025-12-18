from django.contrib.auth import get_user_model
from rest_framework import serializers

from documents.serializers import RenterDocumentSerializer
from renters.models import Renter

User = get_user_model()


class RenterSerializer(serializers.ModelSerializer):
    documents = RenterDocumentSerializer(many=True, read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Renter
        fields = [
            "id",
            "full_name",
            "email",
            "phone_number",
            "alternate_phone",
            "date_of_birth",
            "gender",
            "marital_status",
            "emergency_contact_name",
            "relation",
            "emergency_contact_phone",
            "occupation",
            "company",
            "office_address",
            "profile_pic",
            "nid_scan",
            "created_at",
            "updated_at",
            "documents",
            "status",
            "is_active",
            "is_former",
            "notification_preference",
            "present_address",
            "permanent_address",
            "previous_address",
            "from_date",
            "to_date",
            "landlord_name",
            "landlord_phone",
            "reason_for_leaving"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "status"]

    is_active = serializers.SerializerMethodField()
    is_former = serializers.SerializerMethodField()

    def get_is_active(self, obj):
        return obj.is_active

    def get_is_former(self, obj):
        return obj.is_former

    def create(self, validated_data):
        phone = validated_data.get("phone_number")
        full_name = validated_data.get("full_name")
        email = validated_data.get("email") or f"{phone}@dummy.local"

        # Check if a renter user already exists with this phone
        if User.objects.filter(username=phone, is_renter=True).exists():
            raise serializers.ValidationError({"phone_number": "Renter with this phone already exists."})

        # Create the user
        user = User.objects.create(
            username=phone,
            phone_number=phone,
            is_renter=True,
            email=email or None,
        )
        user.set_unusable_password()  # renter will login via OTP, no password
        user.save()

        renter = Renter.objects.create(user=user, **validated_data)
        return renter

class RenterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Renter
        fields = ["full_name", "phone_number", "email", "profile_pic", "notification_preference"]
        read_only_fields = ["email"]  # email can't be changed if you want

