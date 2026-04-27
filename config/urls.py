from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("apps.identity.urls")),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/projects/", include("apps.projects.urls")),
    path("api/v1/funding/", include("apps.funding.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/analytics/", include("apps.analytics.urls")),
    path("api/v1/admin/", include("apps.adminops.urls")),
    path("api/v1/risk/", include("apps.risk.urls")),

    # API Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Health check
    path("health/", include("apps.common.urls")),
]
