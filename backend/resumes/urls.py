from django.urls import path
from . import views
from analysis import views as analysis_views

urlpatterns = [
    path("", views.list_resumes, name="list_resumes"),
    path("upload/", views.upload_resume, name="upload_resume"),
    path("<int:resume_id>/", views.get_resume, name="get_resume"),
    path("<int:resume_id>/delete/", views.delete_resume, name="delete_resume"),
    path("<int:resume_id>/analyze/", analysis_views.analyze_resume, name="analyze_resume"),
    path("file/<path:path>/", views.serve_resume_file, name="serve_resume_file"),
]