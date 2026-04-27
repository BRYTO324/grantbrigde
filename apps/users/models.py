from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Profile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    # KYC / verification
    is_kyc_verified = models.BooleanField(default=False)
    bvn_verified = models.BooleanField(default=False)
    cac_verified = models.BooleanField(default=False)

    # Funder-specific
    organization_name = models.CharField(max_length=255, blank=True)
    organization_type = models.CharField(max_length=100, blank=True)  # NGO, CSR, Individual

    # Bank details (for payouts)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=20, blank=True)
    bank_account_name = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "profiles"

    def __str__(self):
        return f"Profile({self.user.email})"
