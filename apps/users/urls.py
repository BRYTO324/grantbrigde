from django.urls import path
from . import views

urlpatterns = [
    path("profile/", views.my_profile, name="user-profile"),
    path("profile/update/", views.update_my_profile, name="user-profile-update"),
]
