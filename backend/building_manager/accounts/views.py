# building_manager/accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, RenterOTP
from rest_framework.permissions import AllowAny

class RequestOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_or_email = request.data.get("phone_or_email")
        try:
            user = User.objects.get(username=phone_or_email, is_renter=True)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        RenterOTP.generate_otp(user)
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
