from apps.identity.models import User
from apps.projects.models import Project, ProjectStatus
from apps.funding.models import Transaction, Payout


def get_pending_projects():
    return Project.objects.filter(
        status=ProjectStatus.PENDING_REVIEW, is_deleted=False
    ).select_related("entrepreneur").order_by("created_at")


def get_all_users():
    return User.objects.all().order_by("-created_at")


def get_all_transactions():
    return Transaction.objects.select_related("funder", "project").order_by("-created_at")


def get_all_payouts():
    return Payout.objects.select_related("project", "entrepreneur").order_by("-created_at")
