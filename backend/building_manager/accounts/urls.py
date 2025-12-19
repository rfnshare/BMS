# building_manager/accounts/urls.py
from django.urls import path
from drf_spectacular.utils import extend_schema_view, extend_schema

from .views import RequestOTP, VerifyOTP, detect_role, me, LogoutView, staff_list, DetailedProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

TokenObtainPairView = extend_schema_view(
    post=extend_schema(tags=["Accounts"])
)(TokenObtainPairView)

TokenRefreshView = extend_schema_view(
    post=extend_schema(tags=["Accounts"])
)(TokenRefreshView)
urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("request-otp/", RequestOTP.as_view(), name="request-otp"),
    path("verify-otp/", VerifyOTP.as_view(), name="verify-otp"),
    path("detect-role/", detect_role, name="detect-role"),
    path("me/", me, name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("staff/", staff_list, name="staff-list"),
    path("profile/detailed/", DetailedProfileView.as_view(), name="detailed-profile"),
    ]
