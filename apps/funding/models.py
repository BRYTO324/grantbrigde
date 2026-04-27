from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class TransactionStatus(models.TextChoices):
    INITIALIZED = "initialized", "Initialized"
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    VERIFIED = "verified", "Verified"
    ALLOCATED = "allocated", "Allocated"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"
    REFUNDED = "refunded", "Refunded"


class PayoutStatus(models.TextChoices):
    QUEUED = "queued", "Queued"
    PROCESSING = "processing", "Processing"
    SUCCESSFUL = "successful", "Successful"
    FAILED = "failed", "Failed"
    REVERSED = "reversed", "Reversed"


class Transaction(TimeStampedModel):
    funder = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="transactions"
    )

    # Amounts
    gross_amount = models.DecimalField(max_digits=14, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=4)
    commission_amount = models.DecimalField(max_digits=14, decimal_places=2)
    net_amount = models.DecimalField(max_digits=14, decimal_places=2)

    currency = models.CharField(max_length=10, default="NGN")
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.INITIALIZED, db_index=True)

    # Flutterwave
    flw_tx_ref = models.CharField(max_length=100, unique=True)  # our reference
    flw_transaction_id = models.CharField(max_length=100, blank=True, db_index=True)  # FLW id
    flw_payment_type = models.CharField(max_length=50, blank=True)
    flw_raw_response = models.JSONField(default=dict)

    # Idempotency
    idempotency_key = models.CharField(max_length=100, unique=True)

    # Receipt
    receipt_sent = models.BooleanField(default=False)

    class Meta:
        db_table = "transactions"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["funder"]),
            models.Index(fields=["project"]),
        ]

    def __str__(self):
        return f"TXN {self.flw_tx_ref} - {self.status}"


class PaymentEvent(TimeStampedModel):
    """Immutable log of every payment webhook/event received."""
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)

    class Meta:
        db_table = "payment_events"


class Payout(TimeStampedModel):
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="payouts"
    )
    entrepreneur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payouts"
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=10, default="NGN")
    status = models.CharField(max_length=20, choices=PayoutStatus.choices, default=PayoutStatus.QUEUED, db_index=True)

    # Bank details snapshot at time of payout
    bank_name = models.CharField(max_length=100)
    bank_account_number = models.CharField(max_length=20)
    bank_account_name = models.CharField(max_length=255)

    # Admin
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="approved_payouts"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)

    # External reference
    external_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "payouts"
        indexes = [models.Index(fields=["status"]), models.Index(fields=["project"])]
