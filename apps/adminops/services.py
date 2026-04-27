from apps.identity.models import User


def suspend_user(user: User, reason: str = "") -> User:
    user.is_suspended = True
    user.save(update_fields=["is_suspended"])
    return user


def unsuspend_user(user: User) -> User:
    user.is_suspended = False
    user.save(update_fields=["is_suspended"])
    return user
