# Backend Implementation Plan for AI Resume Analyzer

## Steps:
- [x] Step 1: Create requirements.txt and install dependencies
- [x] Step 2: Update backend/resumes/urls.py with analyze endpoint
- [x] Step 3: Implement full logic in backend/resumes/views.py (PDF parsing with PyMuPDF, OpenAI analysis, save feedback)
- [x] Step 4: Run pip install, makemigrations, migrate, testserver
- [ ] Step 5: Verify with frontend upload/analyze flow

## Current Progress: Backend complete! Run `cd backend && venv\\Scripts\\activate && python manage.py runserver` to start server on http://localhost:8000. Test /api/resumes/upload/ POST with form-data (pdf_file, company_name etc.), then /api/resumes/<resume_id>/analyze/ . Set OPENAI_API_KEY in backend/.env . Frontend integration next if needed.
