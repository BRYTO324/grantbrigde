from django.db.models import QuerySet
from .models import Project, ProjectStatus, ProjectUpdate


def get_live_projects(filters: dict = None) -> QuerySet:
    qs = Project.objects.filter(
        status__in=[ProjectStatus.LIVE, ProjectStatus.PARTIALLY_FUNDED],
        is_deleted=False,
    ).select_related("entrepreneur").prefetch_related("images")

    if filters:
        if filters.get("category"):
            qs = qs.filter(category=filters["category"])
        if filters.get("country"):
            qs = qs.filter(country__icontains=filters["country"])
        if filters.get("min_goal"):
            qs = qs.filter(funding_goal__gte=filters["min_goal"])
        if filters.get("max_goal"):
            qs = qs.filter(funding_goal__lte=filters["max_goal"])
        if filters.get("search"):
            qs = qs.filter(title__icontains=filters["search"])

    return qs.order_by("-created_at")


def get_entrepreneur_projects(entrepreneur) -> QuerySet:
    return Project.objects.filter(
        entrepreneur=entrepreneur, is_deleted=False
    ).order_by("-created_at")


def get_project_by_slug(slug: str) -> Project:
    return Project.objects.select_related("entrepreneur").prefetch_related(
        "images", "documents"
    ).get(slug=slug, is_deleted=False)


def get_project_updates(project: Project) -> QuerySet:
    return ProjectUpdate.objects.filter(project=project, is_public=True).order_by("-created_at")
