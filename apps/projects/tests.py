from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.projects.models import Project, ProjectStatus

User = get_user_model()


class ProjectTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.entrepreneur = User.objects.create_user(
            email="entrepreneur@example.com",
            full_name="Entrepreneur",
            password="StrongPass123!",
            role="entrepreneur",
            is_email_verified=True,
        )
        self.client.force_authenticate(user=self.entrepreneur)

    def test_create_project(self):
        data = {
            "title": "My Farm Project",
            "category": "agriculture",
            "description": "A great farming initiative",
            "funding_goal": "500000.00",
            "min_contribution": "1000.00",
            "country": "Nigeria",
        }
        response = self.client.post("/api/v1/projects/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["status"], ProjectStatus.DRAFT)

    def test_one_active_project_rule(self):
        Project.objects.create(
            entrepreneur=self.entrepreneur,
            title="Existing Project",
            slug="existing-project",
            description="desc",
            funding_goal=100000,
            status=ProjectStatus.PENDING_REVIEW,
        )
        data = {
            "title": "Second Project",
            "category": "technology",
            "description": "Another project",
            "funding_goal": "200000.00",
        }
        response = self.client.post("/api/v1/projects/create/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_projects_public(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/v1/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
