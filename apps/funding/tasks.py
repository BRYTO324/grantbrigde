from celery import shared_task


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def send_payment_receipt(self, transaction_id: str):
    """Send payment receipt email to funder after successful transaction."""
    from apps.funding.models import Transaction, TransactionStatus
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        txn = Transaction.objects.select_related("funder", "project").get(id=transaction_id)
        if txn.receipt_sent:
            return

        message = (
            f"Hi {txn.funder.full_name},\n\n"
            f"Thank you for funding '{txn.project.title}'.\n\n"
            f"Amount: {txn.currency} {txn.gross_amount}\n"
            f"Reference: {txn.flw_tx_ref}\n"
            f"Status: {txn.status}\n\n"
            f"Your contribution is making a difference.\n\nGrantBridge Team"
        )
        send_mail(
            subject="Your GrantBridge funding receipt",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[txn.funder.email],
            fail_silently=False,
        )
        txn.receipt_sent = True
        txn.save(update_fields=["receipt_sent"])
    except Exception as exc:
        raise self.retry(exc=exc)
