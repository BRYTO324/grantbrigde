from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, NotificationType


def create_notification(recipient, notification_type: str, title: str, message: str, metadata: dict = None):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        metadata=metadata or {},
    )


def send_email_notification(recipient_email: str, subject: str, message: str):
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=True,
    )


def notify_project_approved(project):
    user = project.entrepreneur
    create_notification(
        user, NotificationType.PROJECT_APPROVED,
        "Project Approved",
        f"Your project '{project.title}' has been approved and is now live.",
        {"project_id": str(project.id)},
    )
    send_email_notification(
        user.email,
        "Your GrantBridge project is live",
        f"Hi {user.full_name},\n\nYour project '{project.title}' has been approved and is now live on GrantBridge.",
    )


def notify_project_rejected(project):
    user = project.entrepreneur
    create_notification(
        user, NotificationType.PROJECT_REJECTED,
        "Project Rejected",
        f"Your project '{project.title}' was not approved. Reason: {project.rejection_reason}",
        {"project_id": str(project.id)},
    )
    send_email_notification(
        user.email,
        "Update on your GrantBridge project",
        f"Hi {user.full_name},\n\nUnfortunately your project '{project.title}' was not approved.\n\nReason: {project.rejection_reason}",
    )


def notify_funding_received(transaction):
    project = transaction.project
    entrepreneur = project.entrepreneur
    create_notification(
        entrepreneur, NotificationType.FUNDING_RECEIVED,
        "Funding Received",
        f"Your project '{project.title}' received {transaction.currency} {transaction.net_amount}.",
        {"transaction_id": str(transaction.id), "project_id": str(project.id)},
    )


def notify_payout_sent(payout):
    create_notification(
        payout.entrepreneur, NotificationType.PAYOUT_SENT,
        "Payout Processed",
        f"Your payout of {payout.currency} {payout.amount} for '{payout.project.title}' has been processed.",
        {"payout_id": str(payout.id)},
    )
