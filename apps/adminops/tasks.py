from celery import shared_task


@shared_task
def send_admin_daily_digest():
    """Send daily summary email to admins."""
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.conf import settings
    from apps.analytics.selectors import get_admin_dashboard_stats
    from apps.identity.models import UserRole

    User = get_user_model()
    stats = get_admin_dashboard_stats()
    admins = User.objects.filter(role__in=[UserRole.ADMIN, UserRole.SUPER_ADMIN], is_active=True)

    message = (
        f"GrantBridge Daily Digest\n\n"
        f"Total Users: {stats['total_users']}\n"
        f"New Users (30d): {stats['new_users_30d']}\n"
        f"Pending Projects: {stats['pending_projects']}\n"
        f"GMV: {stats['gmv']}\n"
        f"Platform Revenue: {stats['platform_revenue']}\n"
        f"Pending Payouts: {stats['pending_payouts_amount']}\n"
        f"Failed Payments: {stats['failed_payments']}\n"
    )

    for admin in admins:
        send_mail(
            subject="GrantBridge Daily Digest",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin.email],
            fail_silently=True,
        )
