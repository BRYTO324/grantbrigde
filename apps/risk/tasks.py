from celery import shared_task


@shared_task
def check_payment_velocity(user_id: str):
    """Flag users with suspicious payment velocity (many transactions in short window)."""
    from django.utils import timezone
    from datetime import timedelta
    from django.contrib.auth import get_user_model
    from apps.funding.models import Transaction, TransactionStatus
    from .services import flag_user
    from .models import FraudFlagType

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        count = Transaction.objects.filter(
            funder=user,
            created_at__gte=one_hour_ago,
            status__in=[TransactionStatus.PENDING, TransactionStatus.VERIFIED],
        ).count()
        if count >= 10:
            flag_user(
                flagged_user=user,
                flag_type=FraudFlagType.VELOCITY_BREACH,
                description=f"User made {count} transactions in the last hour.",
                metadata={"transaction_count": count},
            )
    except User.DoesNotExist:
        pass
