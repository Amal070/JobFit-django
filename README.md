# AI Resume Analyzer

## Project Overview

AI Resume Analyzer is a full-stack resume review application built with a Django REST backend and a React frontend. Users can upload PDF resumes, register/login with JWT authentication, and analyze resumes against job descriptions using a generative AI service.

The current implementation uses Django, Django REST Framework, and Groq's generative AI API to score resumes and provide structured ATS feedback.

## Features

- 🚀 **AI Resume Scoring**: Analyze resume content against job descriptions using a Groq AI model
- 📄 **PDF Resume Processing**: Extract text from uploaded PDF resumes with PyMuPDF
- 🔐 **JWT Authentication**: User registration and login powered by Django REST Framework Simple JWT
- 💾 **Resume Storage**: Upload, list, view, and delete resumes via Django REST API
- 📊 **Detailed Feedback**: AI returns structured scores and tips for ATS, content, structure, skills, and tone/style
- 🎨 **Responsive UI**: React frontend styled with TailwindCSS and modern client-side routing
- ⚡ **Developer Workflow**: Local frontend development with Vite and React Router dev server

## Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript, TailwindCSS, Zustand
- **Backend**: Django, Django REST Framework, Simple JWT, django-cors-headers
- **AI Integration**: Groq generative AI via `groq` Python package
- **PDF Parsing**: PyMuPDF (`fitz`) for extracting resume text from PDFs
- **Storage**: SQLite for local development, Django media storage for uploaded resumes
- **Deployment**: Frontend Dockerfile included for containerized builds

## Core Backend APIs

- `POST /api/auth/register/` — register a new user
- `POST /api/auth/login/` — obtain JWT access and refresh tokens
- `POST /api/auth/refresh/` — refresh JWT token
- `GET /api/auth/me/` — retrieve authenticated user details
- `GET /api/resumes/` — list uploaded resumes
- `POST /api/resumes/upload/` — upload a resume PDF
- `GET /api/resumes/<id>/` — get resume metadata
- `POST /api/resumes/<id>/analyze/` — analyze a resume with AI
- `DELETE /api/resumes/<id>/delete/` — delete a resume

## Environment Variables

Create a `.env` file in `backend/` with values such as:

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
GROQ_API_KEY=your-groq-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Getting Started

### Backend Setup

1. Create and activate a Python virtual environment:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Apply database migrations:

```bash
python manage.py migrate
```

4. Run the backend server:

```bash
python manage.py runserver
```

### Frontend Setup

1. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

2. Start the frontend development server:

```bash
npm run dev
```

### Production Build

To build the frontend for production:

```bash
npm run build
```

To serve the built frontend:

```bash
npm run start
```

## Notes

- The project no longer uses Puter. Authentication and storage are handled by Django and JWT.
- Uploaded resumes are stored in `backend/media/` during local development.
- The AI analysis pipeline extracts resume text from PDF files and sends it to Groq for scoring.
