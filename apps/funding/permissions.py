from rest_framework.permissions import BasePermission
from apps.identity.models import UserRole


class IsFunder(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.FUNDER, UserRole.NGO, UserRole.ENTREPRENEUR
        ]
