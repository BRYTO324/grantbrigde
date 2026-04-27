from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "phone_number", "country", "is_kyc_verified", "bvn_verified"]
    list_filter = ["is_kyc_verified", "bvn_verified", "cac_verified"]
    search_fields = ["user__email", "user__full_name"]
