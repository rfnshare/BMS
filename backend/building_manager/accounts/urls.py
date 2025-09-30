# building_manager/accounts/urls.py
from django.urls import path
from .views import RequestOTP, VerifyOTP, detect_role, me, LogoutView

urlpatterns = [
    path("request-otp/", RequestOTP.as_view(), name="request-otp"),
    path("verify-otp/", VerifyOTP.as_view(), name="verify-otp"),
    path("detect-role/", detect_role, name="detect-role"),
    path("me/", me, name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
    ]
