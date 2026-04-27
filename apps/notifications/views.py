from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import success_response
from apps.common.pagination import StandardResultsPagination
from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    qs = Notification.objects.filter(recipient=request.user)
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(NotificationSerializer(page, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return success_response(message="All notifications marked as read.")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    Notification.objects.filter(id=pk, recipient=request.user).update(is_read=True)
    return success_response(message="Notification marked as read.")
