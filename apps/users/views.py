from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.common.responses import success_response, error_response
from .serializers import ProfileSerializer, ProfileUpdateSerializer
from .services import get_or_create_profile, update_profile


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile = get_or_create_profile(request.user)
    return success_response(ProfileSerializer(profile).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_my_profile(request):
    serializer = ProfileUpdateSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)
    profile = update_profile(request.user, serializer.validated_data)
    return success_response(ProfileSerializer(profile).data, "Profile updated.")
