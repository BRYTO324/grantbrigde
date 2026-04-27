from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.entrepreneur = User.objects.create_user(
            email="dash@example.com",
            full_name="Dash User",
            password="StrongPass123!",
            role="entrepreneur",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=self.entrepreneur)

    def test_entrepreneur_dashboard(self):
        response = self.client.get("/api/v1/analytics/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("projects_submitted", response.data["data"])

    def test_admin_dashboard_blocked_for_entrepreneur(self):
        response = self.client.get("/api/v1/analytics/admin/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
