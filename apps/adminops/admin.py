from django.contrib import admin
from .models import SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ["subject", "submitted_by", "status", "assigned_to", "created_at"]
    list_filter = ["status"]
    search_fields = ["subject", "submitted_by__email"]
