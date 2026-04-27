from .models import FraudFlag, FraudFlagStatus


def get_open_flags():
    return FraudFlag.objects.filter(
        status=FraudFlagStatus.OPEN
    ).select_related("flagged_user", "reported_by").order_by("-created_at")


def get_flags_for_user(user):
    return FraudFlag.objects.filter(flagged_user=user).order_by("-created_at")
