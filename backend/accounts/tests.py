from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class HealthCheckTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["database"], "connected")

    def test_api_health_check_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ok")


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration_and_login(self):
        # Register new user
        reg_response = self.client.post(
            "/api/auth/register/",
            {"username": "testuser", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", reg_response.data)

        # Login with registered user
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

    def test_duplicate_registration_rejected(self):
        User.objects.create_user(username="existinguser", password="Password123!")
        response = self.client.post(
            "/api/auth/register/",
            {"username": "existinguser", "password": "NewPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
