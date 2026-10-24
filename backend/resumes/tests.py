from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from resumes.models import Resume


class ResumeApiTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="Password123!")
        self.user2 = User.objects.create_user(username="user2", password="Password123!")
        self.client = APIClient()

    def test_unauthenticated_requests_rejected(self):
        response = self.client.get("/api/resumes/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_non_pdf_rejected(self):
        self.client.force_authenticate(user=self.user1)
        fake_txt = SimpleUploadedFile("resume.txt", b"Plain text resume", content_type="text/plain")
        response = self.client.post("/api/resumes/upload/", {"pdf_file": fake_txt}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only PDF resumes are supported", response.data.get("error", ""))

    def test_upload_valid_pdf_succeeds(self):
        self.client.force_authenticate(user=self.user1)
        fake_pdf = SimpleUploadedFile("resume.pdf", b"%PDF-1.4 sample content", content_type="application/pdf")
        response = self.client.post(
            "/api/resumes/upload/",
            {
                "pdf_file": fake_pdf,
                "company_name": "Acme Corp",
                "job_title": "Software Engineer",
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("resume_id", response.data)

    def test_user_isolation_for_resume_access(self):
        # Create resume belonging to user1
        resume = Resume.objects.create(
            user=self.user1,
            company_name="Acme Corp",
            job_title="Dev",
        )

        # User2 tries to fetch user1's resume
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f"/api/resumes/{resume.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User1 can fetch their own resume
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/resumes/{resume.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
