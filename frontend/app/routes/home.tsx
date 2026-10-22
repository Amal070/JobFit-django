import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import ResumeCard from "~/components/ResumeCard";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Resume } from "~/types";
import { isAuthenticated, listResumes } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JobFit — Precision AI Resume Analyzer & ATS Optimization" },
    {
      name: "description",
      content:
        "Get instant, actionable ATS scoring, keyword matching, and structural recommendations for your resume with JobFit AI.",
    },
  ];
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadResumes = async () => {
    setLoadingResumes(true);
    setLoadError(null);
    try {
      const list = await listResumes();
      setResumes(list);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    const logged = isAuthenticated();
    setIsLoggedIn(logged);

    if (logged) {
      loadResumes();
    }
  }, []);

  const handleDeleteResume = (deletedId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== deletedId));
  };

  const analyzedResumes = resumes.filter((r) => r.feedback !== null);
  const avgScore =
    analyzedResumes.length > 0
      ? Math.round(
          analyzedResumes.reduce((acc, r) => acc + (r.feedback?.overallScore || 0), 0) /
            analyzedResumes.length
        )
      : null;
  const highestScore =
    analyzedResumes.length > 0
      ? Math.max(...analyzedResumes.map((r) => r.feedback?.overallScore || 0))
      : null;

  return (
    <div className="app-page">
      <Navbar />

      <main className="flex-1">
        {/* If user is logged in, show their Resume Applications Dashboard */}
        {isLoggedIn ? (
          <section className="app-container py-8 sm:py-12 space-y-8">
            {/* Dashboard Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Application Workspace
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Resume Reports & History
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Review your recent uploads, inspect ATS ratings, and track your tailored improvements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/upload" className="btn-primary !text-xs !py-2.5 !px-5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Analyze New Resume</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Bar */}
            {analyzedResumes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5">
                  <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Total Analyzed
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-[var(--text-primary)]">
                      {analyzedResumes.length}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">resumes</span>
                  </div>
                </div>

                <div className="card p-5">
                  <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Average ATS Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-[var(--text-primary)]">
                      {avgScore !== null ? `${avgScore}%` : "—"}
                    </span>
                    <span className="text-xs text-[var(--color-success)] font-medium">Benchmark</span>
                  </div>
                </div>

                <div className="card p-5">
                  <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Highest Rating
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-[var(--text-primary)]">
                      {highestScore !== null ? `${highestScore}%` : "—"}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">top match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error banner if loading failed */}
            {loadError && (
              <div className="p-4 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-sm text-[var(--color-error)] flex items-center justify-between">
                <span>{loadError}</span>
                <button
                  onClick={() => loadResumes()}
                  className="font-semibold underline cursor-pointer text-xs hover:opacity-85"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Resumes Grid / Empty State */}
            {loadingResumes ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-[var(--text-muted)]">Loading your resume portfolio...</p>
              </div>
            ) : analyzedResumes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Uploaded Submissions ({analyzedResumes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyzedResumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      onDelete={handleDeleteResume}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center max-w-lg mx-auto space-y-5 my-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">No Resumes Analyzed Yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                    Upload your first resume along with a job description to generate your in-depth ATS breakdown.
                  </p>
                </div>
                <div>
                  <Link to="/upload" className="btn-primary">
                    Upload Your First Resume
                  </Link>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Landing Hero & Value Proposition for Visitors */
          <div className="space-y-16 sm:space-y-24 py-12 sm:py-20">
            {/* Hero Section */}
            <section className="app-container text-center max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                Next-Gen ATS Parser & Scoring Engine
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.1]">
                Master the ATS. Land More High-Impact Interviews.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                JobFit audits your resume against targeted job descriptions using advanced AI. Pinpoint missing keywords, format issues, and receive actionable tips in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/upload" className="btn-primary !text-sm !py-3 !px-7 w-full sm:w-auto">
                  Analyze My Resume
                </Link>
                <Link to="/auth" className="btn-secondary !text-sm !py-3 !px-7 w-full sm:w-auto">
                  Create Account
                </Link>
              </div>

              {/* Interface Preview Graphic */}
              <div className="mt-12 pt-6">
                <div className="card p-3 sm:p-5 shadow-2xl border-[var(--border-color)] bg-[var(--bg-surface)] text-left">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
                      <span className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
                      <span className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
                      <span className="font-mono text-[11px] ml-2">JobFit Intelligence Preview</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--color-success)]">
                      ATS Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Overall ATS Score</p>
                        <p className="text-2xl font-black text-[var(--text-primary)] mt-1">88/100</p>
                      </div>
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                        Strong
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Keyword Density</p>
                      <p className="text-sm font-bold text-[var(--text-primary)] mt-1">High Relevance</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Aligned with Software Engineer role</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Action Items</p>
                      <p className="text-sm font-bold text-[var(--text-primary)] mt-1">4 High-Impact Tips</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Quantify project outcomes</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3-Step Process Workflow */}
            <section className="app-container">
              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  The Workflow
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  How JobFit Evaluates Your Resume
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  A straightforward, three-step evaluation designed to maximize employer interview invitations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">
                    01
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Upload PDF Resume</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Drop your resume in PDF format. JobFit extracts textual sections cleanly while checking for parser accessibility.
                  </p>
                </div>

                <div className="card p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">
                    02
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Supply Target Role</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Provide the job title and job description you are targeting to trigger specific keyword and qualification mapping.
                  </p>
                </div>

                <div className="card p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">
                    03
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Receive Actionable Feedback</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Explore granular category scores, ATS flags, content impact improvements, and skills alignment advice.
                  </p>
                </div>
              </div>
            </section>

            {/* Core Features */}
            <section className="app-container">
              <div className="card p-8 sm:p-12 space-y-8">
                <div className="max-w-xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Built for Accuracy
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                    Everything You Need to Beat the Filter
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">ATS Simulation</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Replicates how enterprise ATS screeners score syntax, section headings, and contact info.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Keyword Gap Analysis</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Highlights competencies in the job listing that are missing or underemphasized in your document.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Content & Impact</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Evaluates bullet points for strong action verbs, quantifiable metrics, and active voice.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Instant PDF Preview</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Side-by-side document preview alongside analysis notes for convenient iterative edits.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-[var(--text-muted)]">
                    Ready to evaluate your resume against your target position?
                  </p>
                  <Link to="/upload" className="btn-primary !text-xs !py-2.5 !px-5">
                    Start Free Resume Scan
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}