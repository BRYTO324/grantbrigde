from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.common.responses import success_response, error_response
from apps.common.pagination import StandardResultsPagination
from .serializers import (
    ProjectCreateSerializer, ProjectUpdateSerializer, ProjectDetailSerializer,
    ProjectListSerializer, ProjectProgressUpdateSerializer,
)
from .services import (
    create_project, submit_project_for_review, post_project_update, toggle_save_project
)
from .selectors import get_live_projects, get_entrepreneur_projects, get_project_by_slug, get_project_updates
from .permissions import IsEntrepreneur


@api_view(["GET"])
@permission_classes([AllowAny])
def list_projects(request):
    filters = {
        "category": request.query_params.get("category"),
        "country": request.query_params.get("country"),
        "min_goal": request.query_params.get("min_goal"),
        "max_goal": request.query_params.get("max_goal"),
        "search": request.query_params.get("search"),
    }
    qs = get_live_projects({k: v for k, v in filters.items() if v})
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = ProjectListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def project_detail(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(ProjectDetailSerializer(project).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEntrepreneur])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_project_view(request):
    serializer = ProjectCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)
    try:
        project = create_project(request.user, serializer.validated_data)
    except ValueError as e:
        return error_response(str(e))
    return success_response(ProjectDetailSerializer(project).data, "Project created.", status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsEntrepreneur])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_project_view(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)

    if project.entrepreneur != request.user:
        return error_response("Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

    if project.status not in ["draft"]:
        return error_response("Only draft projects can be edited.")

    serializer = ProjectUpdateSerializer(project, data=request.data, partial=True)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)
    serializer.save()
    return success_response(ProjectDetailSerializer(project).data, "Project updated.")


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEntrepreneur])
def submit_project_view(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    try:
        project = submit_project_for_review(project, request.user)
    except (ValueError, PermissionError) as e:
        return error_response(str(e))
    return success_response(ProjectDetailSerializer(project).data, "Project submitted for review.")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsEntrepreneur])
def my_projects(request):
    qs = get_entrepreneur_projects(request.user)
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(ProjectListSerializer(page, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_project_view(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    result = toggle_save_project(request.user, project)
    msg = "Project saved." if result["saved"] else "Project unsaved."
    return success_response(result, msg)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsEntrepreneur])
def post_update_view(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)

    if project.entrepreneur != request.user:
        return error_response("Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

    serializer = ProjectProgressUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    update = post_project_update(
        project, request.user,
        serializer.validated_data["title"],
        serializer.validated_data["body"],
        serializer.validated_data.get("is_public", True),
    )
    return success_response(ProjectProgressUpdateSerializer(update).data, "Update posted.", status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def project_updates_view(request, slug):
    try:
        project = get_project_by_slug(slug)
    except Exception:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    updates = get_project_updates(project)
    return success_response(ProjectProgressUpdateSerializer(updates, many=True).data)
