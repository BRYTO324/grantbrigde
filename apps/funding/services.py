import uuid
from decimal import Decimal
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone

from apps.projects.models import Project, ProjectStatus
from .models import Transaction, TransactionStatus, PaymentEvent, Payout, PayoutStatus
from . import flutterwave


def _generate_tx_ref() -> str:
    return f"GB-{uuid.uuid4().hex[:16].upper()}"


def _calculate_amounts(gross: Decimal) -> tuple[Decimal, Decimal, Decimal]:
    rate = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    commission = (gross * rate).quantize(Decimal("0.01"))
    net = gross - commission
    return gross, commission, net


@db_transaction.atomic
def initiate_funding(funder, project: Project, amount: Decimal, currency: str = "NGN") -> dict:
    """Create a transaction record and return Flutterwave payment link."""
    if project.status not in [ProjectStatus.LIVE, ProjectStatus.PARTIALLY_FUNDED]:
        raise ValueError("This project is not currently accepting funding.")

    if amount < project.min_contribution:
        raise ValueError(f"Minimum contribution is {project.min_contribution} {currency}.")

    gross, commission, net = _calculate_amounts(amount)
    tx_ref = _generate_tx_ref()
    idempotency_key = f"{funder.id}-{project.id}-{tx_ref}"

    txn = Transaction.objects.create(
        funder=funder,
        project=project,
        gross_amount=gross,
        commission_rate=Decimal(str(settings.PLATFORM_COMMISSION_RATE)),
        commission_amount=commission,
        net_amount=net,
        currency=currency,
        flw_tx_ref=tx_ref,
        idempotency_key=idempotency_key,
        status=TransactionStatus.INITIALIZED,
    )

    redirect_url = f"{settings.FRONTEND_URL}/funding/callback?tx_ref={tx_ref}"
    flw_response = flutterwave.initiate_payment(
        tx_ref=tx_ref,
        amount=float(gross),
        currency=currency,
        email=funder.email,
        name=funder.full_name,
        redirect_url=redirect_url,
        meta={"project_id": str(project.id), "transaction_id": str(txn.id)},
    )

    txn.status = TransactionStatus.PENDING
    txn.save(update_fields=["status", "updated_at"])

    return {
        "transaction_id": str(txn.id),
        "tx_ref": tx_ref,
        "payment_link": flw_response.get("data", {}).get("link"),
    }


@db_transaction.atomic
def process_webhook(payload: dict) -> Transaction | None:
    """Process verified Flutterwave webhook. Idempotent."""
    event_type = payload.get("event")
    data = payload.get("data", {})
    tx_ref = data.get("tx_ref", "")
    flw_transaction_id = str(data.get("id", ""))

    # Idempotency: skip if already processed
    if PaymentEvent.objects.filter(
        transaction__flw_tx_ref=tx_ref, event_type=event_type, processed=True
    ).exists():
        return None

    try:
        txn = Transaction.objects.select_for_update().get(flw_tx_ref=tx_ref)
    except Transaction.DoesNotExist:
        return None

    event = PaymentEvent.objects.create(
        transaction=txn, event_type=event_type, payload=payload
    )

    if event_type == "charge.completed" and data.get("status") == "successful":
        # Server-side verification
        verify_resp = flutterwave.verify_transaction(flw_transaction_id)
        verified_data = verify_resp.get("data", {})

        if (
            verified_data.get("status") == "successful"
            and str(verified_data.get("amount")) == str(txn.gross_amount)
            and verified_data.get("currency") == txn.currency
        ):
            txn.flw_transaction_id = flw_transaction_id
            txn.flw_payment_type = verified_data.get("payment_type", "")
            txn.flw_raw_response = verified_data
            txn.status = TransactionStatus.VERIFIED
            txn.save(update_fields=["flw_transaction_id", "flw_payment_type", "flw_raw_response", "status", "updated_at"])

            # Update project amount_raised
            _allocate_funds(txn)
            event.processed = True
            event.save(update_fields=["processed"])

    return txn


@db_transaction.atomic
def _allocate_funds(txn: Transaction):
    """Update project amount_raised and transition statuses."""
    project = Project.objects.select_for_update().get(id=txn.project_id)
    project.amount_raised += txn.net_amount

    if project.amount_raised >= project.funding_goal:
        project.status = ProjectStatus.FULLY_FUNDED
    else:
        project.status = ProjectStatus.PARTIALLY_FUNDED

    project.save(update_fields=["amount_raised", "status", "updated_at"])

    txn.status = TransactionStatus.ALLOCATED
    txn.save(update_fields=["status", "updated_at"])


@db_transaction.atomic
def create_payout_request(project: Project, admin_user) -> Payout:
    if project.status != ProjectStatus.FULLY_FUNDED:
        raise ValueError("Project must be fully funded before payout.")

    profile = project.entrepreneur.profile
    if not profile.bank_account_number:
        raise ValueError("Entrepreneur has not provided bank details.")

    payout = Payout.objects.create(
        project=project,
        entrepreneur=project.entrepreneur,
        amount=project.amount_raised,
        bank_name=profile.bank_name,
        bank_account_number=profile.bank_account_number,
        bank_account_name=profile.bank_account_name,
        approved_by=admin_user,
        approved_at=timezone.now(),
        status=PayoutStatus.QUEUED,
    )

    project.status = ProjectStatus.PAYOUT_PENDING
    project.save(update_fields=["status", "updated_at"])

    return payout
