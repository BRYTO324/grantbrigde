from .selectors import get_admin_dashboard_stats, get_entrepreneur_dashboard, get_funder_dashboard


def build_dashboard(user) -> dict:
    from apps.identity.models import UserRole
    if user.role == UserRole.ENTREPRENEUR:
        return get_entrepreneur_dashboard(user)
    elif user.role in [UserRole.FUNDER, UserRole.NGO]:
        return get_funder_dashboard(user)
    elif user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        return get_admin_dashboard_stats()
    return {}
