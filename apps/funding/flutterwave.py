"""
Flutterwave integration layer.
All FLW API calls go through this module — never call requests directly from views.
"""
import hashlib
import hmac
import requests
from django.conf import settings

FLW_BASE_URL = "https://api.flutterwave.com/v3"


def _headers():
    return {
        "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def initiate_payment(tx_ref: str, amount: float, currency: str, email: str,
                     name: str, redirect_url: str, meta: dict = None) -> dict:
    """Create a hosted payment link via Flutterwave Standard."""
    payload = {
        "tx_ref": tx_ref,
        "amount": amount,
        "currency": currency,
        "redirect_url": redirect_url,
        "customer": {"email": email, "name": name},
        "customizations": {
            "title": "GrantBridge",
            "description": "Fund a project on GrantBridge",
        },
        "meta": meta or {},
    }
    response = requests.post(f"{FLW_BASE_URL}/payments", json=payload, headers=_headers(), timeout=30)
    response.raise_for_status()
    return response.json()


def verify_transaction(transaction_id: str) -> dict:
    """Server-side verification of a transaction by FLW transaction ID."""
    response = requests.get(
        f"{FLW_BASE_URL}/transactions/{transaction_id}/verify",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def verify_webhook_signature(payload_body: bytes, signature: str) -> bool:
    """Verify Flutterwave webhook HMAC signature."""
    secret = settings.FLUTTERWAVE_WEBHOOK_SECRET.encode()
    expected = hmac.new(secret, payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
