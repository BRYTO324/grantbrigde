from django.contrib import admin
from .models import Transaction, PaymentEvent, Payout


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["flw_tx_ref", "funder", "project", "gross_amount", "status", "created_at"]
    list_filter = ["status", "currency"]
    search_fields = ["flw_tx_ref", "funder__email"]
    readonly_fields = ["flw_raw_response", "idempotency_key"]


@admin.register(PaymentEvent)
class PaymentEventAdmin(admin.ModelAdmin):
    list_display = ["transaction", "event_type", "processed", "created_at"]
    list_filter = ["processed", "event_type"]


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ["project", "entrepreneur", "amount", "status", "approved_at", "created_at"]
    list_filter = ["status"]
    search_fields = ["entrepreneur__email", "project__title"]
