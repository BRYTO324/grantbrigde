from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.projects.models import Project, ProjectStatus

User = get_user_model()


class AdminOpsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin@example.com",
            full_name="Admin User",
            password="StrongPass123!",
            role="admin",
            is_email_verified=True,
            is_staff=True,
        )
        self.entrepreneur = User.objects.create_user(
            email="ent@example.com",
            full_name="Entrepreneur",
            password="StrongPass123!",
            role="entrepreneur",
            is_email_verified=True,
        )
        self.project = Project.objects.create(
            entrepreneur=self.entrepreneur,
            title="Test Project",
            slug="test-project",
            description="desc",
            funding_goal=100000,
            status=ProjectStatus.PENDING_REVIEW,
        )
        self.client.force_authenticate(user=self.admin)

    def test_list_pending_projects(self):
        response = self.client.get("/api/v1/admin/projects/pending/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["meta"]["count"], 1)

    def test_approve_project(self):
        response = self.client.post(f"/api/v1/admin/projects/{self.project.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.LIVE)

    def test_reject_project(self):
        response = self.client.post(
            f"/api/v1/admin/projects/{self.project.id}/reject/",
            {"reason": "Incomplete documentation"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.REJECTED)

    def test_non_admin_blocked(self):
        self.client.force_authenticate(user=self.entrepreneur)
        response = self.client.get("/api/v1/admin/projects/pending/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
