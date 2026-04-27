from rest_framework import serializers
from .models import Transaction, Payout


class InitiateFundingSerializer(serializers.Serializer):
    project_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    currency = serializers.CharField(max_length=10, default="NGN")


class TransactionSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    funder_name = serializers.CharField(source="funder.full_name", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "project_title", "funder_name",
            "gross_amount", "commission_amount", "net_amount", "currency",
            "status", "flw_tx_ref", "flw_transaction_id",
            "receipt_sent", "created_at",
        ]


class PayoutSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    entrepreneur_name = serializers.CharField(source="entrepreneur.full_name", read_only=True)

    class Meta:
        model = Payout
        fields = [
            "id", "project_title", "entrepreneur_name",
            "amount", "currency", "status",
            "bank_name", "bank_account_number", "bank_account_name",
            "approved_at", "processed_at", "failure_reason", "created_at",
        ]
