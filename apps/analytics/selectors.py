from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.identity.models import User
from apps.projects.models import Project, ProjectStatus
from apps.funding.models import Transaction, TransactionStatus, Payout, PayoutStatus


def get_admin_dashboard_stats() -> dict:
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    total_users = User.objects.count()
    new_users_30d = User.objects.filter(created_at__gte=thirty_days_ago).count()
    pending_projects = Project.objects.filter(status=ProjectStatus.PENDING_REVIEW).count()

    gmv = Transaction.objects.filter(
        status=TransactionStatus.ALLOCATED
    ).aggregate(total=Sum("gross_amount"))["total"] or 0

    revenue = Transaction.objects.filter(
        status=TransactionStatus.ALLOCATED
    ).aggregate(total=Sum("commission_amount"))["total"] or 0

    pending_payouts = Payout.objects.filter(
        status__in=[PayoutStatus.QUEUED, PayoutStatus.PROCESSING]
    ).aggregate(total=Sum("amount"))["total"] or 0

    failed_payments = Transaction.objects.filter(status=TransactionStatus.FAILED).count()

    return {
        "total_users": total_users,
        "new_users_30d": new_users_30d,
        "pending_projects": pending_projects,
        "gmv": str(gmv),
        "platform_revenue": str(revenue),
        "pending_payouts_amount": str(pending_payouts),
        "failed_payments": failed_payments,
    }


def get_entrepreneur_dashboard(user) -> dict:
    projects = Project.objects.filter(entrepreneur=user, is_deleted=False)
    total_raised = projects.aggregate(total=Sum("amount_raised"))["total"] or 0
    return {
        "projects_submitted": projects.count(),
        "total_raised": str(total_raised),
        "projects_by_status": list(
            projects.values("status").annotate(count=Count("id"))
        ),
    }


def get_funder_dashboard(user) -> dict:
    txns = Transaction.objects.filter(funder=user, status=TransactionStatus.ALLOCATED)
    total_funded = txns.aggregate(total=Sum("gross_amount"))["total"] or 0
    projects_supported = txns.values("project").distinct().count()
    return {
        "total_funded": str(total_funded),
        "projects_supported": projects_supported,
        "transactions_count": txns.count(),
    }
