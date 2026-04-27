from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("register/", views.register, name="auth-register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("logout/", views.logout, name="auth-logout"),
    path("me/", views.me, name="auth-me"),
    path("verify-email/", views.verify_email, name="auth-verify-email"),
    path("resend-verification/", views.resend_verification, name="auth-resend-verification"),
    path("password-reset/", views.password_reset_request, name="auth-password-reset"),
    path("password-reset/confirm/", views.password_reset_confirm, name="auth-password-reset-confirm"),
    path("change-password/", views.change_password, name="auth-change-password"),
]
