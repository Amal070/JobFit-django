import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import type { Feedback, Resume } from "~/types";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { getResume, fetchFile, isAuthenticated } from "~/lib/api";

export const meta = () => [
  { title: "JobFit — ATS Resume Analysis Report" },
  { name: "description", content: "Detailed ATS scoring and improvement recommendations for your resume." },
];

const ResumePage = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"analysis" | "pdf">("analysis");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [navigate, id]);

  useEffect(() => {
    let objectUrl = "";

    const loadResumeData = async () => {
      if (!id) return;
      setLoading(true);
      setLoadError(null);

      try {
        const fetchedResume = await getResume(id);
        setResume(fetchedResume);
        setFeedback(fetchedResume.feedback);

        // Fetch PDF and generate object URL
        if (fetchedResume.resumePath) {
          const resumeBlob = await fetchFile(fetchedResume.resumePath);
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          objectUrl = URL.createObjectURL(pdfBlob);
          setResumeUrl(objectUrl);
        }
      } catch (err) {
        setLoadError((err as Error).message || "Failed to load resume details.");
      } finally {
        setLoading(false);
      }
    };

    loadResumeData();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  return (
    <div className="app-page">
      <Navbar />

      <main className="flex-1">
        {/* Top Control Bar */}
        <section className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                  {resume?.companyName ? `${resume.companyName} — ` : ""}
                  {resume?.jobTitle || "Resume Assessment"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary !text-xs !py-1.5 !px-3.5"
                >
                  Open PDF
                </a>
              )}
              <Link to="/upload" className="btn-primary !text-xs !py-1.5 !px-4">
                Scan Another
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile View Switcher (Report vs PDF) */}
        <div className="lg:hidden border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] px-4 py-2">
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setMobileTab("analysis")}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mobileTab === "analysis"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Analysis Report
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("pdf")}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mobileTab === "pdf"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Resume PDF Preview
            </button>
          </div>
        </div>

        {/* Loading and Error states */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-9 h-9 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--text-muted)]">
              Generating your comprehensive ATS score report...
            </p>
          </div>
        ) : loadError ? (
          <div className="max-w-xl mx-auto py-16 px-4">
            <div className="card p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error)] flex items-center justify-center font-bold text-xl">
                !
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Unable to Load Review</h2>
              <p className="text-xs text-[var(--text-secondary)]">{loadError}</p>
              <div className="pt-2">
                <Link to="/" className="btn-primary">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : feedback ? (
          /* Main Results Layout: 2-Column Desktop, Responsive Mobile */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: PDF Preview (Sticky on Desktop) */}
              <div
                className={`lg:col-span-5 ${
                  mobileTab === "pdf" ? "block" : "hidden lg:block"
                } lg:sticky lg:top-24`}
              >
                <div className="card overflow-hidden">
                  <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-surface-secondary)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      Document Source Preview
                    </span>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        download={`${resume?.companyName || "Resume"}.pdf`}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
                      >
                        Download
                      </a>
                    )}
                  </div>
                  {resumeUrl ? (
                    <div className="h-[550px] lg:h-[760px] w-full bg-[var(--bg-surface-secondary)]">
                      <iframe
                        src={resumeUrl}
                        className="w-full h-full border-0"
                        title="Resume Document Preview"
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
                      No document preview available
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Full Feedback Report */}
              <div
                className={`lg:col-span-7 space-y-6 ${
                  mobileTab === "analysis" ? "block" : "hidden lg:block"
                }`}
              >
                {/* Overall Score Summary */}
                <Summary feedback={feedback} />

                {/* ATS Specific Score & Screener Tips */}
                <ATS
                  score={feedback.ATS.score}
                  suggestions={(feedback.ATS.tips as any) || []}
                />

                {/* Expandable Category Details */}
                <div className="card p-6 md:p-8">
                  <Details feedback={feedback} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">
            No feedback found for this resume.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ResumePage;