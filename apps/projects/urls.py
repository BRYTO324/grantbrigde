from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_projects, name="project-list"),
    path("mine/", views.my_projects, name="my-projects"),
    path("create/", views.create_project_view, name="project-create"),
    path("<slug:slug>/", views.project_detail, name="project-detail"),
    path("<slug:slug>/update/", views.update_project_view, name="project-update"),
    path("<slug:slug>/submit/", views.submit_project_view, name="project-submit"),
    path("<slug:slug>/save/", views.save_project_view, name="project-save"),
    path("<slug:slug>/post-update/", views.post_update_view, name="project-post-update"),
    path("<slug:slug>/updates/", views.project_updates_view, name="project-updates"),
]
