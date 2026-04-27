import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPCode, AuditLog, User


def generate_otp(length=6):
    return "".join(random.choices(string.digits, k=length))


def create_otp(user, purpose: str, expiry_minutes: int = 15) -> OTPCode:
    # Invalidate existing unused OTPs for same purpose
    OTPCode.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
    otp = OTPCode.objects.create(
        user=user,
        code=generate_otp(),
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=expiry_minutes),
    )
    return otp


def verify_otp(user, code: str, purpose: str) -> bool:
    otp = OTPCode.objects.filter(
        user=user, code=code, purpose=purpose, is_used=False, expires_at__gt=timezone.now()
    ).first()
    if not otp:
        return False
    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return True


def send_otp_email(user, otp: OTPCode, purpose: str):
    subjects = {
        "email_verify": "Verify your GrantBridge email",
        "password_reset": "Reset your GrantBridge password",
    }
    messages = {
        "email_verify": f"Hi {user.full_name},\n\nYour verification code is: {otp.code}\n\nExpires in 15 minutes.",
        "password_reset": f"Hi {user.full_name},\n\nYour password reset code is: {otp.code}\n\nExpires in 15 minutes.",
    }
    send_mail(
        subject=subjects.get(purpose, "GrantBridge Code"),
        message=messages.get(purpose, f"Your code: {otp.code}"),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def log_audit(user, action: str, ip_address=None, metadata=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        metadata=metadata or {},
    )


def get_client_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
