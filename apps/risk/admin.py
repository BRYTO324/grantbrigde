from django.contrib import admin
from .models import FraudFlag


@admin.register(FraudFlag)
class FraudFlagAdmin(admin.ModelAdmin):
    list_display = ["flagged_user", "flag_type", "status", "reported_by", "created_at"]
    list_filter = ["flag_type", "status"]
    search_fields = ["flagged_user__email"]
