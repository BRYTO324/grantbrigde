from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/login/"

    def test_register_success(self):
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "role": "entrepreneur",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])

    def test_register_password_mismatch(self):
        data = {
            "email": "test2@example.com",
            "full_name": "Test User",
            "role": "entrepreneur",
            "password": "StrongPass123!",
            "password2": "WrongPass123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_login_unverified_email_blocked(self):
        User.objects.create_user(
            email="unverified@example.com",
            full_name="Unverified",
            password="StrongPass123!",
            is_email_verified=False,
        )
        response = self.client.post(self.login_url, {
            "email": "unverified@example.com",
            "password": "StrongPass123!",
        })
        # SimpleJWT returns 400 for serializer-level validation errors
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED])
        self.assertFalse(response.data.get("success", True))
