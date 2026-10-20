from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse, Http404
from django.conf import settings
import os
import mimetypes
from .models import Resume
from .serializers import ResumeSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_resumes(request):
    resumes = Resume.objects.filter(user=request.user).order_by("-uploaded_at")
    serializer = ResumeSerializer(resumes, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_resume(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ResumeSerializer(resume)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    pdf_file = request.FILES.get("pdf_file")
    if not pdf_file:
        return Response({"error": "No PDF file provided"}, status=status.HTTP_400_BAD_REQUEST)

    resume = Resume.objects.create(
        user=request.user,
        pdf_file=pdf_file,
        company_name=request.data.get("company_name", ""),
        job_title=request.data.get("job_title", ""),
        job_description=request.data.get("job_description", ""),
    )

    return Response({
        "resume_id": resume.id,
        "pdf_path": resume.pdf_file.name,
    }, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_resume(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

    resume.pdf_file.delete()  # delete file from disk
    resume.delete()
    return Response({"message": "Resume deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def serve_resume_file(request, path):
    """
    Serve a resume file with authentication check.
    Path should be the relative path from MEDIA_ROOT, e.g., 'resumes/pdfs/filename.pdf'
    """
    # Validate path - prevent directory traversal
    if '..' in path or path.startswith('/') or path.startswith('\\'):
        raise Http404("Invalid file path")

    # Construct full file path
    file_path = os.path.join(settings.MEDIA_ROOT, path)

    # Check if file exists
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404("File not found")

    # Check if this file belongs to the authenticated user
    # Extract filename from path
    filename = os.path.basename(path)
    try:
        # Find resume with this filename that belongs to the user
        resume = Resume.objects.get(
            user=request.user,
            pdf_file__endswith=filename
        )
    except Resume.DoesNotExist:
        raise Http404("File not found or access denied")

    # Serve the file
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()

        # Get MIME type
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        response = HttpResponse(file_data, content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response

    except IOError:
        raise Http404("File could not be read")