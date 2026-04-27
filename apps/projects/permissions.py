from rest_framework.permissions import BasePermission
from apps.identity.models import UserRole


class IsEntrepreneur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.ENTREPRENEUR


class IsFunder(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [UserRole.FUNDER, UserRole.NGO]


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]


class IsProjectOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.entrepreneur == request.user
