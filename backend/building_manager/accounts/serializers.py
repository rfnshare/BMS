from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_superadmin", "is_manager", "is_renter"]

    def get_role(self, obj):
        if obj.is_superadmin:
            return "superadmin"
        elif obj.is_manager:
            return "manager"
        elif obj.is_renter:
            return "renter"
        return "unknown"
