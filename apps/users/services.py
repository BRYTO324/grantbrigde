from .models import Profile


def get_or_create_profile(user) -> Profile:
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def update_profile(user, data: dict) -> Profile:
    profile = get_or_create_profile(user)
    for field, value in data.items():
        setattr(profile, field, value)
    profile.save()
    return profile
