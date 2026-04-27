from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_async(self, subject: str, message: str, recipient_list: list):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_otp_email_async(self, user_id: str, otp_code: str, purpose: str):
    from apps.identity.models import User
    try:
        user = User.objects.get(id=user_id)
        subjects = {
            "email_verify": "Verify your GrantBridge email",
            "password_reset": "Reset your GrantBridge password",
        }
        messages = {
            "email_verify": f"Hi {user.full_name},\n\nYour verification code is: {otp_code}\n\nExpires in 15 minutes.",
            "password_reset": f"Hi {user.full_name},\n\nYour password reset code is: {otp_code}\n\nExpires in 15 minutes.",
        }
        send_mail(
            subject=subjects.get(purpose, "GrantBridge Code"),
            message=messages.get(purpose, f"Your code: {otp_code}"),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)
