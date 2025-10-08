# building_manager/renters/admin.py
from django.contrib import admin
from .models import Renter
from django.utils.translation import gettext_lazy as _


class RenterAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "user",
        "email",
        "phone_number",
        "status",
        "gender",
        "marital_status",
        "date_of_birth",
        "monthly_income",
        "is_active",
    )
    list_filter = (
        "status",
        "gender",
        "marital_status",
        "notification_preference",
        "date_of_birth",
        "monthly_income",
    )
    search_fields = ("full_name", "phone_number", "email", "user__username")
    ordering = ("-date_of_birth",)

    fieldsets = (
        (None, {
            'fields': ('user', 'full_name', 'email', 'phone_number', 'alternate_phone', 'date_of_birth', 'gender', 'marital_status')
        }),
        (_('Spouse Information'), {
            'fields': ('spouse_name', 'spouse_phone')
        }),
        (_('Nationality & Status'), {
            'fields': ('nationality', 'status')
        }),
        (_('Address Information'), {
            'fields': ('present_address', 'permanent_address', 'previous_address', 'from_date', 'to_date', 'landlord_name', 'landlord_phone', 'reason_for_leaving')
        }),
        (_('Emergency Contact & Occupation'), {
            'fields': ('emergency_contact_name', 'relation', 'emergency_contact_phone', 'occupation', 'company', 'office_address', 'monthly_income')
        }),
        (_('Document Uploads'), {
            'fields': ('profile_pic', 'nid_scan')
        }),
        (_('Notification Preferences'), {
            'fields': ('notification_preference',)
        }),
    )

    readonly_fields = ("user",)  # Makes the 'user' field read-only in the admin interface

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user')

    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True  # Renders as a boolean (tick or cross)

    def is_former(self, obj):
        return obj.is_former
    is_former.boolean = True  # Renders as a boolean (tick or cross)


# Register the model with the admin site
admin.site.register(Renter, RenterAdmin)
