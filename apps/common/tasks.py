from celery import shared_task


@shared_task
def health_ping():
    """Celery heartbeat task for monitoring."""
    return "pong"
