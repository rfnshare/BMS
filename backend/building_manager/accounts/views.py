# building_manager/accounts/views.py

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
    username = serializers.CharField()


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
        try:
            user = User.objects.get(username=phone_or_email, is_renter=True)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        otp_instance = RenterOTP.generate_otp(user)

        if not user.phone_number:
            return Response({"error": "User does not have a phone number"}, status=status.HTTP_400_BAD_REQUEST)

        # send_otp_whatsapp(user.phone_number, otp_instance.code)
        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)


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

        try:
            user = User.objects.get(username=phone_or_email, is_renter=True)
            otp = RenterOTP.objects.filter(user=user, code=code, is_used=False).last()
            if not otp or not otp.is_valid():
                raise Exception("Invalid OTP")
        except Exception:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

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
    username_or_phone = request.data.get('username')
    if not username_or_phone:
        return Response({"error": "Username or phone is required"}, status=400)

    try:
        user = User.objects.get(username=username_or_phone)
    except User.DoesNotExist:
        try:
            user = User.objects.get(phone_number=username_or_phone)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    role = "renter" if user.is_renter else "staff"
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
