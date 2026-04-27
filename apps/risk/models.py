from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class FraudFlagType(models.TextChoices):
    DUPLICATE_ACCOUNT = "duplicate_account", "Duplicate Account"
    SUSPICIOUS_PAYMENT = "suspicious_payment", "Suspicious Payment"
    COMMUNITY_REPORT = "community_report", "Community Report"
    VELOCITY_BREACH = "velocity_breach", "Velocity Breach"
    MANUAL_FLAG = "manual_flag", "Manual Flag"


class FraudFlagStatus(models.TextChoices):
    OPEN = "open", "Open"
    UNDER_REVIEW = "under_review", "Under Review"
    RESOLVED = "resolved", "Resolved"
    DISMISSED = "dismissed", "Dismissed"


class FraudFlag(TimeStampedModel):
    flagged_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fraud_flags"
    )
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="reported_flags"
    )
    flag_type = models.CharField(max_length=50, choices=FraudFlagType.choices)
    status = models.CharField(max_length=20, choices=FraudFlagStatus.choices, default=FraudFlagStatus.OPEN, db_index=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="resolved_flags"
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_note = models.TextField(blank=True)

    class Meta:
        db_table = "fraud_flags"
        indexes = [models.Index(fields=["flagged_user", "status"])]
