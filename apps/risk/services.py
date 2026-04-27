from django.utils import timezone
from .models import FraudFlag, FraudFlagType, FraudFlagStatus


def flag_user(flagged_user, flag_type: str, description: str, reported_by=None, metadata: dict = None) -> FraudFlag:
    return FraudFlag.objects.create(
        flagged_user=flagged_user,
        reported_by=reported_by,
        flag_type=flag_type,
        description=description,
        metadata=metadata or {},
    )


def resolve_flag(flag: FraudFlag, admin_user, note: str) -> FraudFlag:
    flag.status = FraudFlagStatus.RESOLVED
    flag.resolved_by = admin_user
    flag.resolved_at = timezone.now()
    flag.resolution_note = note
    flag.save(update_fields=["status", "resolved_by", "resolved_at", "resolution_note", "updated_at"])
    return flag


def check_duplicate_email_heuristic(email: str) -> bool:
    """Basic heuristic: flag if same email domain used by many accounts."""
    from apps.identity.models import User
    domain = email.split("@")[-1]
    count = User.objects.filter(email__endswith=f"@{domain}").count()
    return count > 10  # configurable threshold
