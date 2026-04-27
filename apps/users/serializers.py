from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id", "email", "full_name", "role",
            "bio", "phone_number", "country", "state", "city", "avatar",
            "is_kyc_verified", "bvn_verified", "cac_verified",
            "organization_name", "organization_type",
            "bank_name", "bank_account_number", "bank_account_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "full_name", "role", "is_kyc_verified", "bvn_verified", "cac_verified", "created_at", "updated_at"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "bio", "phone_number", "country", "state", "city", "avatar",
            "organization_name", "organization_type",
            "bank_name", "bank_account_number", "bank_account_name",
        ]
