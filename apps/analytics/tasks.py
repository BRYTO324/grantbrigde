from celery import shared_task


@shared_task
def generate_weekly_digest():
    """Send weekly impact digest to funders."""
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.conf import settings
    from apps.identity.models import UserRole
    from .selectors import get_funder_dashboard

    User = get_user_model()
    funders = User.objects.filter(role__in=[UserRole.FUNDER, UserRole.NGO], is_active=True)

    for funder in funders:
        stats = get_funder_dashboard(funder)
        message = (
            f"Hi {funder.full_name},\n\n"
            f"Your GrantBridge Impact Summary:\n"
            f"Total Funded: {stats['total_funded']}\n"
            f"Projects Supported: {stats['projects_supported']}\n"
            f"Transactions: {stats['transactions_count']}\n\n"
            f"Thank you for making a difference.\n\nGrantBridge Team"
        )
        send_mail(
            subject="Your Weekly GrantBridge Impact Summary",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[funder.email],
            fail_silently=True,
        )
