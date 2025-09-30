# building_manager/accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, RenterOTP
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .serializers import UserSerializer
from .services import send_otp_whatsapp


class RequestOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get("phone_or_email")
        try:
            # Get the user by username, ensure it's a renter
            user = User.objects.get(username=phone_or_email, is_renter=True)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp_instance = RenterOTP.generate_otp(user)
        otp_code = otp_instance.code

        # Use the phone field of the user, not username
        if not user.phone_number:
            return Response({"error": "User does not have a phone number"}, status=status.HTTP_400_BAD_REQUEST)

        # send_otp_whatsapp(user.phone_number, otp_code)

        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)



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


@api_view(['POST'])
@permission_classes([AllowAny])
def detect_role(request):
    username_or_phone = request.data.get('username')
    if not username_or_phone:
        return Response({"error": "Username or phone is required"}, status=400)

    try:
        # Try to find user by username or phone number
        user = User.objects.get(username=username_or_phone)
    except User.DoesNotExist:
        try:
            user = User.objects.get(phone_number=username_or_phone)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    if user.is_renter:
        role = "renter"
    else:
        role = "staff"  # superadmin or manager

    return Response({"role": role})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """
        Logout by blacklisting the refresh token.
        Requires Authorization: Bearer <access_token> header
        and refresh token in the body.
        """
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)