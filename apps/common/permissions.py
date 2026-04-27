from rest_framework.permissions import BasePermission
from apps.identity.models import UserRole


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.ADMIN, UserRole.SUPER_ADMIN
        ]


class IsEmailVerified(BasePermission):
    message = "Email verification required."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_email_verified
