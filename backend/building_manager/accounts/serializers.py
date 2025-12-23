from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_superadmin", "is_manager", "is_renter"]

    @extend_schema_field(str)
    def get_role(self, obj):
        if obj.is_superadmin:
            return "superadmin"
        elif obj.is_manager:
            return "manager"
        elif obj.is_renter:
            return "renter"
        return "unknown"

class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%d %b %Y", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "phone_number", "role", "profile_picture", "bio", "date_joined"
        ]
        # Make most fields read-only for the basic GET,
        # but allow PATCH to update specific ones
        extra_kwargs = {
            'username': {'read_only': True},
            'email': {'read_only': True},
        }

    @extend_schema_field(str)
    def get_role(self, obj):
        if obj.is_superadmin: return "Super Admin"
        if obj.is_manager: return "Building Manager"
        if obj.is_renter: return "Renter"
        return "Unknown"