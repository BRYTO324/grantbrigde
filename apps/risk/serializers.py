from rest_framework import serializers
from .models import FraudFlag


class FraudFlagSerializer(serializers.ModelSerializer):
    flagged_user_email = serializers.EmailField(source="flagged_user.email", read_only=True)
    reported_by_email = serializers.EmailField(source="reported_by.email", read_only=True)

    class Meta:
        model = FraudFlag
        fields = [
            "id", "flagged_user_email", "reported_by_email",
            "flag_type", "status", "description",
            "resolution_note", "resolved_at", "created_at",
        ]
        read_only_fields = fields


class ReportUserSerializer(serializers.Serializer):
    description = serializers.CharField(min_length=10)
