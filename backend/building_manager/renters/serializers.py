from django.contrib.auth import get_user_model
from rest_framework import serializers

from documents.serializers import RenterDocumentSerializer
from renters.models import Renter

User = get_user_model()


class RenterSerializer(serializers.ModelSerializer):
    documents = RenterDocumentSerializer(many=True, read_only=True)
    status = serializers.CharField(read_only=True)
    email = serializers.EmailField(source="user.email", required=False, allow_null=True)
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
            "reason_for_leaving",
            "spouse_name",
            "spouse_phone",
            "nationality",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "status"]

    is_active = serializers.SerializerMethodField()
    is_former = serializers.SerializerMethodField()

    def get_is_active(self, obj):
        return obj.is_active

    def get_is_former(self, obj):
        return obj.is_former

    def create(self, validated_data):
        # We need to pop 'email' out because it's not a field on Renter
        # 'user__email' is how DRF handles the 'source' mapping during input
        user_data = validated_data.pop('user', {})
        email = user_data.get('email')

        phone = validated_data.get("phone_number")

        # Professional fallback for email
        final_email = email or f"{phone}@dummy.local"

        if User.objects.filter(username=phone).exists():
            raise serializers.ValidationError({"phone_number": "User with this phone already exists."})

        # 1. Create User
        user = User.objects.create(
            username=phone,
            phone_number=phone,
            is_renter=True,
            email=final_email,
        )
        user.set_unusable_password()
        user.save()

        # 2. Create Renter linked to that User
        renter = Renter.objects.create(user=user, **validated_data)
        return renter

class RenterProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", required=False, allow_null=True)
    class Meta:
        model = Renter
        fields = ["full_name", "phone_number", "email", "profile_pic", "notification_preference"]
        read_only_fields = ["email"]  # email can't be changed if you want

