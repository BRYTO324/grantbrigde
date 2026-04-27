from django.db.models import Sum, QuerySet
from .models import Transaction, TransactionStatus, Payout, PayoutStatus


def get_transactions_for_project(project) -> QuerySet:
    return Transaction.objects.filter(
        project=project, status=TransactionStatus.ALLOCATED
    ).select_related("funder").order_by("-created_at")


def get_ledger_summary() -> dict:
    allocated = Transaction.objects.filter(status=TransactionStatus.ALLOCATED)
    return {
        "total_collected": allocated.aggregate(t=Sum("gross_amount"))["t"] or 0,
        "total_commission": allocated.aggregate(t=Sum("commission_amount"))["t"] or 0,
        "total_net_allocated": allocated.aggregate(t=Sum("net_amount"))["t"] or 0,
        "total_refunded": Transaction.objects.filter(
            status=TransactionStatus.REFUNDED
        ).aggregate(t=Sum("gross_amount"))["t"] or 0,
        "pending_payouts": Payout.objects.filter(
            status__in=[PayoutStatus.QUEUED, PayoutStatus.PROCESSING]
        ).aggregate(t=Sum("amount"))["t"] or 0,
        "successful_payouts": Payout.objects.filter(
            status=PayoutStatus.SUCCESSFUL
        ).aggregate(t=Sum("amount"))["t"] or 0,
    }
