from rest_framework.permissions import BasePermission
from apps.identity.models import UserRole


class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.ADMIN, UserRole.SUPER_ADMIN
        ]
