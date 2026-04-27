from django.utils.text import slugify
from django.utils import timezone
from django.db import transaction
from .models import Project, ProjectStatus, ProjectUpdate, SavedProject


def generate_unique_slug(title: str) -> str:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while Project.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


@transaction.atomic
def create_project(entrepreneur, data: dict) -> Project:
    # Enforce one active live project rule
    active_statuses = [
        ProjectStatus.PENDING_REVIEW, ProjectStatus.APPROVED,
        ProjectStatus.LIVE, ProjectStatus.PARTIALLY_FUNDED,
    ]
    if Project.objects.filter(entrepreneur=entrepreneur, status__in=active_statuses, is_deleted=False).exists():
        raise ValueError("You already have an active project. Complete or close it before submitting a new one.")

    project = Project(**data)
    project.entrepreneur = entrepreneur
    project.slug = generate_unique_slug(data.get("title", "project"))
    project.status = ProjectStatus.DRAFT
    project.save()
    return project


@transaction.atomic
def submit_project_for_review(project: Project, entrepreneur) -> Project:
    if project.entrepreneur != entrepreneur:
        raise PermissionError("Not your project.")
    if project.status != ProjectStatus.DRAFT:
        raise ValueError(f"Only draft projects can be submitted. Current status: {project.status}")
    project.status = ProjectStatus.PENDING_REVIEW
    project.save(update_fields=["status", "updated_at"])
    return project


@transaction.atomic
def approve_project(project: Project, admin_user) -> Project:
    if project.status != ProjectStatus.PENDING_REVIEW:
        raise ValueError("Only pending projects can be approved.")
    project.status = ProjectStatus.LIVE
    project.reviewed_by = admin_user
    project.reviewed_at = timezone.now()
    project.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])
    return project


@transaction.atomic
def reject_project(project: Project, admin_user, reason: str) -> Project:
    if project.status != ProjectStatus.PENDING_REVIEW:
        raise ValueError("Only pending projects can be rejected.")
    project.status = ProjectStatus.REJECTED
    project.reviewed_by = admin_user
    project.reviewed_at = timezone.now()
    project.rejection_reason = reason
    project.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason", "updated_at"])
    return project


def post_project_update(project: Project, author, title: str, body: str, is_public: bool = True) -> ProjectUpdate:
    return ProjectUpdate.objects.create(
        project=project, author=author, title=title, body=body, is_public=is_public
    )


def toggle_save_project(user, project: Project) -> dict:
    saved, created = SavedProject.objects.get_or_create(user=user, project=project)
    if not created:
        saved.delete()
        return {"saved": False}
    return {"saved": True}
