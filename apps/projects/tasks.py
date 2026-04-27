from celery import shared_task


@shared_task
def notify_funders_of_project_update(project_id: str, update_id: str):
    """Notify all funders of a project when entrepreneur posts an update."""
    from apps.projects.models import Project, ProjectUpdate
    from apps.funding.models import Transaction, TransactionStatus
    from apps.notifications.services import create_notification
    from apps.notifications.models import NotificationType

    try:
        project = Project.objects.get(id=project_id)
        update = ProjectUpdate.objects.get(id=update_id)
        funder_ids = Transaction.objects.filter(
            project=project, status=TransactionStatus.ALLOCATED
        ).values_list("funder_id", flat=True).distinct()

        from django.contrib.auth import get_user_model
        User = get_user_model()
        for funder in User.objects.filter(id__in=funder_ids):
            create_notification(
                recipient=funder,
                notification_type=NotificationType.PROJECT_UPDATE,
                title=f"Update: {project.title}",
                message=update.title,
                metadata={"project_id": str(project.id), "update_id": str(update.id)},
            )
    except Exception:
        pass
