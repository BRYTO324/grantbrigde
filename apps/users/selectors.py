from .models import Profile


def get_profile(user) -> Profile:
    return Profile.objects.select_related("user").get(user=user)
