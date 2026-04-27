from django.urls import path
from . import views

urlpatterns = [
    path("report/<uuid:user_id>/", views.report_user, name="report-user"),
]
