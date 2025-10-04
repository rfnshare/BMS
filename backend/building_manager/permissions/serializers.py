# permissions/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import AppPermission

User = get_user_model()  # <-- this gets the actual User model

class AppPermissionSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),  # <-- use actual model
        required=False
    )

    class Meta:
        model = AppPermission
        fields = [
            "id",
            "role",
            "app_label",
            "model_name",
            "can_create",
            "can_read",
            "can_update",
            "can_delete",
            "assigned_to",
        ]
