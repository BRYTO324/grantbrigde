from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.my_dashboard, name="my-dashboard"),
    path("admin/dashboard/", views.admin_dashboard, name="admin-dashboard"),
]
