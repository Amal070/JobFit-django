from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from resumes.models import Resume
from .models import Analysis
from .ai_service import analyze_resume_with_ai


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_resume(request, resume_id):
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

    force_reanalyze = (
        request.data.get("force", False)
        or request.query_params.get("force") == "true"
    )

    # Return existing analysis if already done and force re-analysis was not requested
    if hasattr(resume, "analysis") and not force_reanalyze:
        return Response({"feedback": resume.analysis.feedback})

    import os
    import re

    if not resume.pdf_file or not os.path.exists(resume.pdf_file.path):
        return Response(
            {"error": "The resume PDF file was not found on the server. Please re-upload your resume."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        feedback = analyze_resume_with_ai(
            pdf_path=resume.pdf_file.path,
            job_title=resume.job_title,
            job_description=resume.job_description,
            company_name=resume.company_name,
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error_msg = str(e)
        if "Connection error" in error_msg or "Failed to connect" in error_msg:
            error_msg = "Groq AI connection error. Please verify your GROQ_API_KEY and check your internet connection."
        elif "rate_limit" in error_msg.lower() or "429" in error_msg:
            error_msg = "AI analysis rate limit reached. Please wait a moment and try again."
        elif "authentication" in error_msg.lower() or "401" in error_msg or "invalid api key" in error_msg.lower():
            error_msg = "Invalid AI API credentials. Please check your GROQ_API_KEY configuration."
        else:
            # Redact any accidental key patterns or internal credentials
            error_msg = re.sub(r'(gsk_[a-zA-Z0-9_-]+)', '[REDACTED]', error_msg)
        return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Save or update analysis in DB
    if hasattr(resume, "analysis"):
        analysis = resume.analysis
        analysis.feedback = feedback
        analysis.save()
    else:
        analysis = Analysis.objects.create(resume=resume, feedback=feedback)

    # Also update feedback cache on the resume
    resume.feedback = feedback
    resume.save()

    return Response({"feedback": feedback})