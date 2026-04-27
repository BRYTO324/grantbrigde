from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class NotificationType(models.TextChoices):
    ACCOUNT_VERIFIED = "account_verified", "Account Verified"
    PROJECT_APPROVED = "project_approved", "Project Approved"
    PROJECT_REJECTED = "project_rejected", "Project Rejected"
    FUNDING_RECEIVED = "funding_received", "Funding Received"
    PAYOUT_SENT = "payout_sent", "Payout Sent"
    PROJECT_UPDATE = "project_update", "Project Update"
    PASSWORD_RESET = "password_reset", "Password Reset"
    GENERAL = "general", "General"


class Notification(TimeStampedModel):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]
