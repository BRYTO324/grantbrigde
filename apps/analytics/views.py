from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import success_response, error_response
from apps.projects.permissions import IsAdminUser
from apps.identity.models import UserRole
from .selectors import get_admin_dashboard_stats, get_entrepreneur_dashboard, get_funder_dashboard


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard(request):
    stats = get_admin_dashboard_stats()
    return success_response(stats, "Admin dashboard stats.")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_dashboard(request):
    user = request.user
    if user.role == UserRole.ENTREPRENEUR:
        data = get_entrepreneur_dashboard(user)
    elif user.role in [UserRole.FUNDER, UserRole.NGO]:
        data = get_funder_dashboard(user)
    else:
        return error_response("No dashboard available for this role.")
    return success_response(data, "Dashboard stats.")
