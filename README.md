# JobFit — Precision AI Resume Analyzer & ATS Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-green.svg)](https://www.djangoproject.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-red.svg)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

JobFit is a modern full-stack career platform designed to help job seekers bypass Applicant Tracking System (ATS) screeners. Built with a **Django REST Framework** backend and a **React 19 + React Router 7** frontend, JobFit parses PDF resumes, matches them against specific job listings, and leverages ultra-fast **Groq AI inference** to generate actionable scores, keyword recommendations, and formatting feedback.

---

## Highlights & Features

- 🎯 **ATS Compatibility Scoring**: Generates an overall ATS readiness score (0–100) alongside qualitative screener feedback.
- 🔍 **Deep Category Breakdown**:
  - **Tone & Style**: Evaluates phrasing, formality, and active voice.
  - **Content & Impact**: Reviews quantifiable metrics and achievements.
  - **Structure & Layout**: Audits section headers, chronological flow, and scannability.
  - **Skills & Keywords**: Detects critical role requirements and flags keyword gaps.
- 🌓 **Monochrome Design with Dark & Light Modes**: Minimalist aesthetic (inspired by Linear and Vercel) with instant theme switching (Dark, Light, System) and zero flash of unstyled content.
- 📄 **Interactive PDF Document Viewer**: Side-by-side desktop view and mobile tab switcher for inspecting resume formatting alongside feedback.
- ⚡ **Resilient AI Pipeline**: Dynamic model selection (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) with automatic fallback and robust JSON response extraction.
- 🔐 **JWT Session Authentication**: User registration, login, and token refresh isolating all resume data to the authenticated user.
- 📱 **Mobile-First Responsive UI**: Fully tested and responsive across all viewports (320px mobile to 1440px desktop).

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router 7 (SPA Mode), TypeScript, Vite, Tailwind CSS v4, react-dropzone |
| **Backend** | Django, Django REST Framework, Simple JWT, django-cors-headers, python-dotenv |
| **AI Inference** | Groq Python SDK (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) |
| **PDF Extraction**| PyMuPDF (`pymupdf` / `fitz`) |
| **Database** | SQLite (development) / PostgreSQL ready |

---

## Project Structure

```text
JobFit-AI/
├── backend/
│   ├── accounts/             # User registration, login, JWT views & serializers
│   ├── analysis/             # AI analysis pipeline & Groq inference service
│   │   ├── ai_service.py     # PDF text extraction & model fallback handler
│   │   └── views.py          # /api/resumes/<id>/analyze/ endpoint
│   ├── core/                 # Django settings, CORS, and root URLs
│   ├── resumes/              # Resume uploads, model storage, and file serving
│   ├── .env.example          # Environment variables template
│   └── manage.py
├── frontend/
│   ├── app/
│   │   ├── components/       # UI components (Navbar, Footer, ScoreGauge, ATS, Details)
│   │   ├── routes/           # Application pages (home, upload, resume, auth, wipe)
│   │   ├── root.tsx          # Root layout & theme hydration bootstrap
│   │   └── app.css           # Semantic monochrome tokens & base styles
│   ├── lib/
│   │   ├── api.ts            # Client API client with auth interceptors
│   │   └── theme.tsx         # ThemeContext provider and toggle component
│   └── vite.config.ts        # Vite + Tailwind + React Router config
├── .gitignore                # Comprehensive security & artifact filter
└── README.md
```

---

## Backend REST APIs

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register/` | Register a new user | No |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh tokens | No |
| `POST` | `/api/auth/refresh/` | Refresh expired access token | No |
| `GET` | `/api/auth/me/` | Retrieve current authenticated user | Yes |
| `GET` | `/api/resumes/` | List all resumes for current user | Yes |
| `POST` | `/api/resumes/upload/` | Upload a PDF resume with target job info | Yes |
| `GET` | `/api/resumes/<id>/` | Get resume details and stored analysis | Yes |
| `POST` | `/api/resumes/<id>/analyze/` | Run AI analysis on uploaded resume | Yes |
| `GET` | `/api/resumes/file/<path>/` | Securely serve uploaded resume PDF | Yes |
| `DELETE`| `/api/resumes/<id>/delete/` | Delete resume and attached files | Yes |

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- A free **[Groq API Key](https://console.groq.com/keys)**

---

### 1. Backend Setup

1. **Navigate to backend and create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate the environment:**
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env     # Windows
   cp .env.example .env       # macOS / Linux
   ```

   Edit `backend/.env` with your credentials:
   ```env
   DJANGO_SECRET_KEY=your-custom-secret-key
   DEBUG=True
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```
   *The backend will be live at `http://127.0.0.1:8000/`.*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *The application will be live at `http://localhost:5173/`.*

---

## Production Build

To compile the frontend for production:

```bash
cd frontend
npm run build
```

The compiled static assets will be output to `frontend/build/client/`.

---

## Security & Privacy

- **Protected Secrets:** All environment files (`.env`, `*.env`) and private keys are ignored via `.gitignore` to prevent leaks.
- **Isolated User Data:** Resumes and analysis reports are associated only with the user who uploaded them; unauthorized users cannot query or view another user's files.
- **Local Storage:** Uploaded PDFs are stored in `backend/media/` during local development and excluded from version control.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
