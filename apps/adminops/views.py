from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import success_response, error_response
from apps.common.pagination import StandardResultsPagination
from apps.identity.models import User
from apps.projects.models import Project, ProjectStatus
from apps.projects.services import approve_project, reject_project
from apps.projects.permissions import IsAdminUser
from apps.risk.models import FraudFlag
from apps.risk.services import resolve_flag
from apps.notifications.services import notify_project_approved, notify_project_rejected
from .serializers import (
    AdminUserSerializer, AdminProjectSerializer, AdminFraudFlagSerializer,
    RejectProjectSerializer, SuspendUserSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_list_users(request):
    qs = User.objects.all().order_by("-created_at")
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AdminUserSerializer(page, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_suspend_user(request, user_id):
    serializer = SuspendUserSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return error_response("User not found.", status_code=status.HTTP_404_NOT_FOUND)
    user.is_suspended = True
    user.save(update_fields=["is_suspended"])
    return success_response(message=f"User {user.email} suspended.")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_unsuspend_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return error_response("User not found.", status_code=status.HTTP_404_NOT_FOUND)
    user.is_suspended = False
    user.save(update_fields=["is_suspended"])
    return success_response(message=f"User {user.email} unsuspended.")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_pending_projects(request):
    qs = Project.objects.filter(status=ProjectStatus.PENDING_REVIEW, is_deleted=False).select_related("entrepreneur").order_by("created_at")
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AdminProjectSerializer(page, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_approve_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    try:
        project = approve_project(project, request.user)
        notify_project_approved(project)
    except ValueError as e:
        return error_response(str(e))
    return success_response(AdminProjectSerializer(project).data, "Project approved.")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_reject_project(request, project_id):
    serializer = RejectProjectSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    try:
        project = reject_project(project, request.user, serializer.validated_data["reason"])
        notify_project_rejected(project)
    except ValueError as e:
        return error_response(str(e))
    return success_response(AdminProjectSerializer(project).data, "Project rejected.")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_fraud_flags(request):
    qs = FraudFlag.objects.select_related("flagged_user").filter(status="open").order_by("-created_at")
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AdminFraudFlagSerializer(page, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_resolve_flag(request, flag_id):
    note = request.data.get("note", "")
    try:
        flag = FraudFlag.objects.get(id=flag_id)
    except FraudFlag.DoesNotExist:
        return error_response("Flag not found.", status_code=status.HTTP_404_NOT_FOUND)
    resolve_flag(flag, request.user, note)
    return success_response(message="Flag resolved.")
