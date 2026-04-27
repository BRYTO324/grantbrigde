from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="profile@example.com",
            full_name="Profile User",
            password="StrongPass123!",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get("/api/v1/users/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_update_profile(self):
        response = self.client.patch("/api/v1/users/profile/update/", {"bio": "Hello world"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
