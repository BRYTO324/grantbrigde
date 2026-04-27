from celery import shared_task


@shared_task
def send_welcome_email(user_id: str):
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.conf import settings
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        send_mail(
            subject="Welcome to GrantBridge",
            message=f"Hi {user.full_name},\n\nWelcome to GrantBridge. Your account is ready.\n\nThe GrantBridge Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass
