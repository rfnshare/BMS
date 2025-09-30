# building_manager/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, RenterOTP

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Roles", {"fields": ("is_superadmin", "is_manager", "is_renter", "phone_number")}),
    )
    list_display = ("username", "email", "is_superadmin", "is_manager", "is_renter")


@admin.register(RenterOTP)
class RenterOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "code", "created_at", "valid_until", "is_used")
