from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class RiskTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reporter = User.objects.create_user(
            email="reporter@example.com",
            full_name="Reporter",
            password="StrongPass123!",
            is_email_verified=True,
        )
        self.target = User.objects.create_user(
            email="target@example.com",
            full_name="Target User",
            password="StrongPass123!",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=self.reporter)

    def test_report_user(self):
        response = self.client.post(
            f"/api/v1/risk/report/{self.target.id}/",
            {"description": "Suspicious activity observed."},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
