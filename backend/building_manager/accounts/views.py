# building_manager/accounts/views.py
import re

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import serializers
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, RenterOTP
from .serializers import UserSerializer


# --- Serializers for Swagger docs only (inline or move to `serializers.py`) ---

class OTPRequestSerializer(serializers.Serializer):
    phone_or_email = serializers.CharField()


class OTPVerifySerializer(serializers.Serializer):
    phone_or_email = serializers.CharField()
    otp = serializers.CharField()


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class DetectRoleSerializer(serializers.Serializer):
    phone_or_email = serializers.CharField()


class RoleResponseSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["renter", "staff"])


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()


# --------------------- Views ---------------------

@extend_schema(
    request=OTPRequestSerializer,
    responses={200: OpenApiResponse(description="OTP sent successfully")},
    summary="Request OTP",
    description="Send OTP to renter's registered phone number",
    tags=["Accounts"]
)
class RequestOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get("phone_or_email")

        if not phone_or_email:
            return Response(
                {"error": "phone_or_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if input is an email or phone
        email_pattern = r"[^@]+@[^@]+\.[^@]+"
        is_email = re.match(email_pattern, phone_or_email)

        try:
            if is_email:
                user = User.objects.get(email=phone_or_email, is_renter=True)
            else:
                normalized_phone = phone_or_email.strip().replace(" ", "")
                user = User.objects.get(phone_number=normalized_phone, is_renter=True)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate OTP → signal handles sending
        RenterOTP.generate_otp(user)

        return Response(
            {"message": "OTP sent successfully"},
            status=status.HTTP_200_OK
        )


@extend_schema(
    request=OTPVerifySerializer,
    responses={200: TokenResponseSerializer, 400: OpenApiResponse(description="Invalid OTP")},
    summary="Verify OTP",
    description="Verify the OTP and return access & refresh tokens",
    tags=["Accounts"]
)

class VerifyOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get("phone_or_email")
        code = request.data.get("otp")

        if not phone_or_email or not code:
            return Response(
                {"error": "phone_or_email and otp are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detect email vs phone
        email_pattern = r"[^@]+@[^@]+\.[^@]+"
        is_email = re.match(email_pattern, phone_or_email)

        try:
            if is_email:
                user = User.objects.get(email=phone_or_email, is_renter=True)
            else:
                normalized_phone = phone_or_email.strip().replace(" ", "")
                user = User.objects.get(phone_number=normalized_phone, is_renter=True)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check OTP
        otp_instance = RenterOTP.objects.filter(user=user, code=code, is_used=False).last()
        if not otp_instance or not otp_instance.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as used
        otp_instance.is_used = True
        otp_instance.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })


@extend_schema(
    request=DetectRoleSerializer,
    responses={200: RoleResponseSerializer, 404: OpenApiResponse(description="User not found")},
    summary="Detect user role",
    description="Detects if a user is renter or staff",
    tags=["Accounts"]
)
@api_view(['POST'])
@permission_classes([AllowAny])
def detect_role(request):
    phone_or_email = request.data.get("phone_or_email")

    if not phone_or_email:
        return Response(
            {"error": "phone_or_email is required"},
            status=400
        )

    # Detect email vs phone number
    email_pattern = r"[^@]+@[^@]+\.[^@]+"
    is_email = re.match(email_pattern, phone_or_email)

    try:
        if is_email:
            user = User.objects.get(email=phone_or_email)
        else:
            normalized_phone = phone_or_email.strip().replace(" ", "")
            user = User.objects.get(phone_number=normalized_phone)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Determine user role
    if user.is_renter:
        role = "renter"
    elif user.is_superadmin or user.is_manager:
        role = "staff"
    else:
        role = "unknown"

    return Response({"role": role})


@extend_schema(
    responses={200: UserSerializer},
    summary="Get current user info",
    description="Returns the authenticated user's details",
    tags=["Accounts"]
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema(
    request=RefreshTokenSerializer,
    responses={205: OpenApiResponse(description="Logout successful")},
    summary="Logout user",
    description="Blacklists the refresh token and logs the user out",
    tags=["Accounts"]
)
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
