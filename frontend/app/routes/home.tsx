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
    { title: "JobFit | Resume analyzer and ATS optimization" },
    {
      name: "description",
      content:
        "See how applicant tracking systems read your resume. Get an ATS score, missing keywords, and ranked fixes for the job you want.",
    },
  ];
}

const workflowSteps = [
  {
    title: "Upload your resume",
    body: "Send a PDF. JobFit extracts the text and checks whether an ATS can read it at all.",
  },
  {
    title: "Add the role",
    body: "Paste the job title and description. Every keyword and qualification is matched against it.",
  },
  {
    title: "Fix what matters most",
    body: "Get a score by category and a list of changes, ordered by how much each one would help.",
  },
];

const features = [
  {
    title: "ATS simulation",
    body: "Shows how an applicant tracking system parses your headings, contact details, and layout.",
  },
  {
    title: "Keyword gap analysis",
    body: "Lists skills and terms the job asks for that are missing or buried in your resume.",
  },
  {
    title: "Bullet-point review",
    body: "Flags weak verbs, passive phrasing, and achievements that lack a measurable result.",
  },
  {
    title: "Side-by-side preview",
    body: "Keeps your resume beside the notes, so each edit can be checked where it appears.",
  },
];

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
        {isLoggedIn ? (
          /* Signed-in workspace */
          <section className="app-container py-6 sm:py-12 space-y-8 sm:space-y-10">
            <header className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1.5 sm:space-y-2">
                <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Your resumes
                </h1>
                <p className="max-w-lg text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Review each report, see where your scores stand, and track the changes you have made.
                </p>
              </div>

              <Link to="/upload" className="btn-primary !text-sm !py-2.5 !px-5 w-full sm:w-auto text-center self-stretch sm:self-auto">
                Analyze a new resume
              </Link>
            </header>

            {analyzedResumes.length > 0 && (
              <dl className="grid grid-cols-3 divide-x divide-[var(--border-color)] border-y border-[var(--border-color)] text-center sm:text-left">
                <div className="py-3.5 sm:py-5 px-2 sm:px-6">
                  <dt className="text-xs sm:text-sm text-[var(--text-muted)] truncate">Analyzed</dt>
                  <dd className="mt-0.5 sm:mt-1 font-display text-xl sm:text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
                    {analyzedResumes.length}
                  </dd>
                </div>
                <div className="py-3.5 sm:py-5 px-2 sm:px-6">
                  <dt className="text-xs sm:text-sm text-[var(--text-muted)] truncate">Average score</dt>
                  <dd className="mt-0.5 sm:mt-1 font-display text-xl sm:text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
                    {avgScore !== null ? `${avgScore}%` : "—"}
                  </dd>
                </div>
                <div className="py-3.5 sm:py-5 px-2 sm:px-6">
                  <dt className="text-xs sm:text-sm text-[var(--text-muted)] truncate">Best score</dt>
                  <dd className="mt-0.5 sm:mt-1 font-display text-xl sm:text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
                    {highestScore !== null ? `${highestScore}%` : "—"}
                  </dd>
                </div>
              </dl>
            )}

            {loadError && (
              <div
                role="alert"
                className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]"
              >
                <span>{loadError}</span>
                <button onClick={() => loadResumes()} className="font-semibold underline underline-offset-4 hover:opacity-80">
                  Try again
                </button>
              </div>
            )}

            {loadingResumes ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 sm:py-24">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--text-primary)] border-t-transparent" />
                <p className="text-sm text-[var(--text-muted)]">Loading your resumes</p>
              </div>
            ) : analyzedResumes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {analyzedResumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} onDelete={handleDeleteResume} />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-md space-y-4 py-12 sm:py-16 text-center">
                <h2 className="font-display text-2xl text-[var(--text-primary)]">No reports yet</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Upload a resume with the job description you are applying for. Your first report takes less than a minute.
                </p>
                <div>
                  <Link to="/upload" className="btn-primary !text-sm !py-2.5 !px-5 w-full sm:w-auto">
                    Upload a resume
                  </Link>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Visitor landing page */
          <div className="pb-16 sm:pb-28">
            {/* Hero */}
            <section className="app-container grid gap-8 sm:gap-12 pt-8 sm:pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] sm:leading-[1.05] text-[var(--text-primary)]">
                  Find out why your resume gets filtered out.
                </h1>
                <p className="max-w-xl text-sm sm:text-lg leading-relaxed text-[var(--text-secondary)]">
                  JobFit reads your resume the way an applicant tracking system does, then compares it with the job you want. You get a score, the keywords you are missing, and fixes ranked by impact.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/upload" className="btn-primary !text-sm !py-3 !px-7 text-center w-full sm:w-auto">
                    Analyze my resume
                  </Link>
                  <Link to="/auth" className="btn-secondary !text-sm !py-3 !px-7 text-center w-full sm:w-auto">
                    Create an account
                  </Link>
                </div>
              </div>

              {/* Sample report */}
              <figure className="relative">
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 sm:p-7 shadow-[0_24px_48px_-24px_rgb(20_33_61/0.25)]">
                  <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border-color)] pb-4 sm:pb-5">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">Sample report for Software Engineer</p>
                      <p className="mt-1 font-display text-4xl sm:text-5xl font-semibold text-[var(--text-primary)]">
                        88<span className="text-xl sm:text-2xl text-[var(--text-muted)]"> / 100</span>
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--accent-pass)] px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex-shrink-0">
                      Strong match
                    </span>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <div className="relative h-1.5 rounded-full bg-[var(--bg-surface-secondary)]">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent-pass)]" style={{ width: "88%" }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] sm:text-xs text-[var(--text-muted)]">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>

                  <ul className="mt-4 sm:mt-6 divide-y divide-[var(--border-color)] text-xs sm:text-sm">
                    <li className="flex items-start justify-between gap-3 py-2.5 sm:py-3">
                      <span className="text-[var(--text-primary)] leading-snug">Missing keywords: Kubernetes, CI/CD</span>
                      <span className="shrink-0 font-semibold text-[var(--accent-fix)] text-xs px-2 py-0.5 rounded bg-[var(--color-warning-bg)]">Fix</span>
                    </li>
                    <li className="flex items-start justify-between gap-3 py-2.5 sm:py-3">
                      <span className="text-[var(--text-primary)] leading-snug">Two bullets have no measurable result</span>
                      <span className="shrink-0 font-semibold text-[var(--accent-fix)] text-xs px-2 py-0.5 rounded bg-[var(--color-warning-bg)]">Fix</span>
                    </li>
                    <li className="flex items-start justify-between gap-3 py-2.5 sm:py-3">
                      <span className="text-[var(--text-primary)] leading-snug">Contact details and headings parse correctly</span>
                      <span className="shrink-0 font-semibold text-[var(--accent-pass)] text-xs px-2 py-0.5 rounded bg-[var(--color-success-bg)]">Pass</span>
                    </li>
                  </ul>
                </div>
              </figure>
            </section>

            {/* Process */}
            <section className="app-container mt-16 sm:mt-28">
              <div className="max-w-xl space-y-2 sm:space-y-3">
                <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Three steps from draft to submission
                </h2>
                <p className="text-xs sm:text-base leading-relaxed text-[var(--text-secondary)]">
                  Each step feeds the next, so the feedback fits the role you are applying for.
                </p>
              </div>

              <ol className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <li key={step.title} className="border-t-2 border-[var(--text-primary)] pt-4 sm:pt-5 space-y-2 sm:space-y-3">
                    <p className="font-display text-xl sm:text-2xl text-[var(--text-muted)]">{index + 1}</p>
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Features */}
            <section className="app-container mt-16 sm:mt-28">
              <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
                <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                  What the report covers
                </h2>

                <ul className="grid border-t border-[var(--border-color)] sm:grid-cols-2">
                  {features.map((feature) => (
                    <li key={feature.title} className="border-b border-[var(--border-color)] py-5 sm:py-6 sm:pr-6 space-y-1.5 sm:space-y-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{feature.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Closing call to action */}
            <section className="app-container mt-16 sm:mt-28">
              <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[var(--ink)] p-6 sm:px-10 sm:py-10 md:px-12 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <p className="font-display text-xl sm:text-3xl font-semibold text-white">
                    Check your resume against the job you want.
                  </p>
                  <p className="text-xs sm:text-sm text-white/70">Your first scan is free, and it takes about a minute.</p>
                </div>
                <Link to="/upload" className="w-full sm:w-auto text-center shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-white/90 active:scale-95 transition-all">
                  Start a free scan
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}