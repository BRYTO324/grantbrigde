from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.common.responses import success_response, error_response
from apps.identity.models import User
from apps.projects.permissions import IsAdminUser
from .models import FraudFlag, FraudFlagType
from .services import flag_user


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_user(request, user_id):
    """Community reporting endpoint."""
    description = request.data.get("description", "")
    if not description:
        return error_response("Description is required.")
    try:
        flagged = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return error_response("User not found.", status_code=status.HTTP_404_NOT_FOUND)

    flag_user(
        flagged_user=flagged,
        flag_type=FraudFlagType.COMMUNITY_REPORT,
        description=description,
        reported_by=request.user,
    )
    return success_response(message="Report submitted. Our team will review it.")
