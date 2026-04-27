from .models import User, AuditLog


def get_user_by_email(email: str):
    return User.objects.filter(email=email).first()


def get_audit_logs_for_user(user):
    return AuditLog.objects.filter(user=user).order_by("-created_at")
