from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.admin_list_users, name="admin-users"),
    path("users/<uuid:user_id>/suspend/", views.admin_suspend_user, name="admin-suspend-user"),
    path("users/<uuid:user_id>/unsuspend/", views.admin_unsuspend_user, name="admin-unsuspend-user"),
    path("projects/pending/", views.admin_pending_projects, name="admin-pending-projects"),
    path("projects/<uuid:project_id>/approve/", views.admin_approve_project, name="admin-approve-project"),
    path("projects/<uuid:project_id>/reject/", views.admin_reject_project, name="admin-reject-project"),
    path("fraud-flags/", views.admin_fraud_flags, name="admin-fraud-flags"),
    path("fraud-flags/<uuid:flag_id>/resolve/", views.admin_resolve_flag, name="admin-resolve-flag"),
]
