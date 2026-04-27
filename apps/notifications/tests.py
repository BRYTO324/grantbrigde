from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.notifications.models import Notification, NotificationType

User = get_user_model()


class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="notify@example.com",
            full_name="Notify User",
            password="StrongPass123!",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=self.user)
        Notification.objects.create(
            recipient=self.user,
            notification_type=NotificationType.GENERAL,
            title="Test",
            message="Test notification",
        )

    def test_list_notifications(self):
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["meta"]["count"], 1)

    def test_mark_all_read(self):
        response = self.client.post("/api/v1/notifications/mark-all-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(recipient=self.user, is_read=False).count(), 0)
