from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.responses import success_response, error_response
from .models import User
from .serializers import (
    RegisterSerializer, UserSerializer, VerifyEmailSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)
from .services import create_otp, verify_otp, send_otp_email, log_audit, get_client_ip


class LoginRateThrottle(AnonRateThrottle):
    rate = "5/min"


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    user = serializer.save()
    otp = create_otp(user, "email_verify")
    send_otp_email(user, otp, "email_verify")
    log_audit(user, "register", get_client_ip(request))

    return success_response(
        UserSerializer(user).data,
        "Registration successful. Check your email for verification code.",
        status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    serializer = VerifyEmailSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    try:
        user = User.objects.get(email=serializer.validated_data["email"])
    except User.DoesNotExist:
        return error_response("User not found.", status_code=status.HTTP_404_NOT_FOUND)

    if user.is_email_verified:
        return success_response(message="Email already verified.")

    if not verify_otp(user, serializer.validated_data["code"], "email_verify"):
        return error_response("Invalid or expired code.")

    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    log_audit(user, "email_verified", get_client_ip(request))

    return success_response(message="Email verified successfully.")


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email, is_email_verified=False)
    except User.DoesNotExist:
        return error_response("User not found or already verified.", status_code=status.HTTP_404_NOT_FOUND)

    otp = create_otp(user, "email_verify")
    send_otp_email(user, otp, "email_verify")
    return success_response(message="Verification code resent.")


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    try:
        user = User.objects.get(email=serializer.validated_data["email"])
        otp = create_otp(user, "password_reset")
        send_otp_email(user, otp, "password_reset")
    except User.DoesNotExist:
        pass  # Don't reveal if email exists

    return success_response(message="If that email exists, a reset code has been sent.")


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    try:
        user = User.objects.get(email=serializer.validated_data["email"])
    except User.DoesNotExist:
        return error_response("User not found.", status_code=status.HTTP_404_NOT_FOUND)

    if not verify_otp(user, serializer.validated_data["code"], "password_reset"):
        return error_response("Invalid or expired code.")

    user.set_password(serializer.validated_data["new_password"])
    user.save(update_fields=["password"])
    log_audit(user, "password_reset", get_client_ip(request))

    return success_response(message="Password reset successful.")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    user = request.user
    if not user.check_password(serializer.validated_data["old_password"]):
        return error_response("Old password is incorrect.")

    user.set_password(serializer.validated_data["new_password"])
    user.save(update_fields=["password"])
    log_audit(user, "password_changed", get_client_ip(request))

    return success_response(message="Password changed successfully.")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        log_audit(request.user, "logout", get_client_ip(request))
        return success_response(message="Logged out successfully.")
    except Exception:
        return error_response("Invalid token.")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return success_response(UserSerializer(request.user).data)
