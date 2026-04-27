from .models import Notification


def get_unread_count(user) -> int:
    return Notification.objects.filter(recipient=user, is_read=False).count()


def get_notifications_for_user(user):
    return Notification.objects.filter(recipient=user).order_by("-created_at")
