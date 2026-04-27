from rest_framework import serializers
from apps.identity.models import User
from apps.projects.models import Project
from apps.funding.models import Transaction, Payout
from apps.risk.models import FraudFlag


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "is_active", "is_email_verified", "is_suspended", "created_at"]


class AdminProjectSerializer(serializers.ModelSerializer):
    entrepreneur_email = serializers.EmailField(source="entrepreneur.email", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "category", "status",
            "funding_goal", "amount_raised", "entrepreneur_email",
            "rejection_reason", "reviewed_at", "created_at",
        ]


class AdminFraudFlagSerializer(serializers.ModelSerializer):
    flagged_user_email = serializers.EmailField(source="flagged_user.email", read_only=True)

    class Meta:
        model = FraudFlag
        fields = [
            "id", "flagged_user_email", "flag_type", "status",
            "description", "resolution_note", "created_at",
        ]


class RejectProjectSerializer(serializers.Serializer):
    reason = serializers.CharField()


class SuspendUserSerializer(serializers.Serializer):
    reason = serializers.CharField()
