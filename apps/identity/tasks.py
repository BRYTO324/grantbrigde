from celery import shared_task


@shared_task
def cleanup_expired_otps():
    """Periodic task: remove expired, used OTP codes."""
    from django.utils import timezone
    from .models import OTPCode
    deleted, _ = OTPCode.objects.filter(expires_at__lt=timezone.now(), is_used=True).delete()
    return f"Deleted {deleted} expired OTPs"
