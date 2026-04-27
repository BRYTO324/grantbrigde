from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPCode, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "full_name", "role", "is_email_verified", "is_suspended", "created_at"]
    list_filter = ["role", "is_email_verified", "is_suspended", "is_active"]
    search_fields = ["email", "full_name"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("full_name", "role")}),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser", "is_email_verified", "is_suspended")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "full_name", "role", "password1", "password2")}),
    )


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ["user", "purpose", "is_used", "expires_at", "created_at"]
    list_filter = ["purpose", "is_used"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["user", "action", "ip_address", "created_at"]
    list_filter = ["action"]
    search_fields = ["user__email", "action"]
