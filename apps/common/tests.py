from django.test import TestCase
from rest_framework.test import APIClient


class HealthCheckTest(TestCase):
    def test_health_endpoint(self):
        client = APIClient()
        response = client.get("/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")
