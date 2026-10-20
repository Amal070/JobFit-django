import { type FormEvent, useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import FileUploader from "~/components/FileUploader";
import type { Feedback } from "~/types";
import { Link, useNavigate } from "react-router";
import { prepareInstructions, AIResponseFormat } from "../../constants";
import { analyzeResume, uploadResume, isAuthenticated } from "~/lib/api";

export function meta() {
  return [
    { title: "Upload & Analyze Resume — JobFit" },
    {
      name: "description",
      content: "Upload your PDF resume and target job description for instant AI ATS scoring.",
    },
  ];
}

const isTipType = (value: unknown): value is "good" | "improve" =>
  value === "good" || value === "improve";

const normalizeTips = (
  tips: unknown,
  requireExplanation: boolean
): { type: "good" | "improve"; tip: string; explanation?: string }[] => {
  if (!Array.isArray(tips)) return [];

  return tips
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const tipType = (item as { type?: unknown }).type;
      const tipText = (item as { tip?: unknown }).tip;
      const explanation = (item as { explanation?: unknown }).explanation;

      if (!isTipType(tipType) || typeof tipText !== "string") return null;
      if (requireExplanation && typeof explanation !== "string") return null;

      if (requireExplanation) {
        return { type: tipType, tip: tipText, explanation };
      }
      return { type: tipType, tip: tipText };
    })
    .filter((tip): tip is { type: "good" | "improve"; tip: string; explanation?: string } => tip !== null);
};

const normalizeFeedback = (raw: unknown): Feedback | null => {
  if (!raw || typeof raw !== "object") return null;

  const root = raw as Record<string, unknown>;
  const section = (name: keyof Feedback) => root[name] as Record<string, unknown> | undefined;

  const toValidScore = (value: unknown): number | null => {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    const clamped = Math.max(0, Math.min(100, value));
    return Math.round(clamped);
  };

  const overallScore = toValidScore(root.overallScore);
  const ats = section("ATS");
  const toneAndStyle = section("toneAndStyle");
  const content = section("content");
  const structure = section("structure");
  const skills = section("skills");

  if (overallScore === null || !ats || !toneAndStyle || !content || !structure || !skills) return null;

  const atsScore = toValidScore(ats.score);
  const toneScore = toValidScore(toneAndStyle.score);
  const contentScore = toValidScore(content.score);
  const structureScore = toValidScore(structure.score);
  const skillsScore = toValidScore(skills.score);

  if (
    atsScore === null ||
    toneScore === null ||
    contentScore === null ||
    structureScore === null ||
    skillsScore === null
  ) {
    return null;
  }

  return {
    overallScore,
    ATS: {
      score: atsScore,
      tips: normalizeTips(ats.tips, false) as Feedback["ATS"]["tips"],
    },
    toneAndStyle: {
      score: toneScore,
      tips: normalizeTips(toneAndStyle.tips, true) as Feedback["toneAndStyle"]["tips"],
    },
    content: {
      score: contentScore,
      tips: normalizeTips(content.tips, true) as Feedback["content"]["tips"],
    },
    structure: {
      score: structureScore,
      tips: normalizeTips(structure.tips, true) as Feedback["structure"]["tips"],
    },
    skills: {
      score: skillsScore,
      tips: normalizeTips(skills.tips, true) as Feedback["skills"]["tips"],
    },
  };
};

const Upload = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Controlled form state to preserve data across recoverable errors
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth?next=/upload");
    }
  }, [navigate]);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && error) {
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file (PDF).");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please specify the target Job Title.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      setStatusText("Uploading resume document to secure storage...");
      const uploadedResume = await uploadResume(file, {
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
      });

      setStatusText("Running AI parsing, keyword matching, and ATS evaluation...");
      const feedbackResponse = await analyzeResume(
        uploadedResume.id,
        prepareInstructions({
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          AIResponseFormat,
        })
      );

      const rawContent = feedbackResponse.feedback || feedbackResponse?.message?.content;
      const feedbackText =
        typeof rawContent === "string"
          ? rawContent
          : Array.isArray(rawContent)
          ? rawContent[0]?.text ?? JSON.stringify(rawContent)
          : JSON.stringify(rawContent);

      const parsedFeedback =
        typeof rawContent === "object" && !Array.isArray(rawContent)
          ? rawContent
          : JSON.parse(feedbackText);

      const normalized = normalizeFeedback(parsedFeedback);
      if (!normalized) {
        throw new Error("AI response format mismatch. Please retry.");
      }

      setStatusText("Generating your personalized review report...");
      navigate(`/resume/${uploadedResume.id}`);
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred during analysis.");
      setStatusText("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAnalyze();
  };

  return (
    <div className="app-page">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="app-container max-w-3xl">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] text-[11px] font-semibold text-[var(--text-muted)]">
              <span>ATS Readiness Check</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Analyze Your Resume
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Upload your resume and supply details about the role you want. JobFit computes ATS suitability, keyword coverage, and section-by-section improvements.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-4 mb-6 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-xs md:text-sm text-[var(--color-error)] flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Processing / Loading View */}
          {isProcessing ? (
            <div className="card p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--border-color)]" />
                <div className="absolute inset-0 rounded-full border-4 border-[var(--text-primary)] border-t-transparent animate-spin" />
                <span className="text-lg font-black text-[var(--text-primary)]">AI</span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Evaluating Your Application
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {statusText || "Processing document..."}
                </p>
              </div>

              {/* Progress Stepper indicators */}
              <div className="max-w-xs mx-auto grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border-color)]">
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-[var(--text-primary)]" />
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Extracting</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-[var(--text-primary)] animate-pulse" />
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Screening</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-[var(--border-color)]" />
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Scoring</p>
                </div>
              </div>
            </div>
          ) : (
            /* Upload & Details Form */
            <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Section */}
              <div className="card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="resume-file-input" className="input-label !mb-0">
                    Resume Document (PDF) <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Max 20 MB</span>
                </div>
                <FileUploader onFileSelect={handleFileSelect} selectedFile={file} />
              </div>

              {/* Target Job Information */}
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Target Opportunity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company-name" className="input-label">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      name="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, Google, or Startup"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="job-title" className="input-label">
                      Job Title <span className="text-[var(--color-error)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="job-title"
                      name="job-title"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="job-description" className="input-label !mb-0">
                      Job Description & Requirements
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {jobDescription.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    id="job-description"
                    name="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description, required qualifications, and key responsibilities here for precise keyword mapping..."
                    className="textarea-field"
                  />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                    Tip: The more detailed the job description, the more accurate the ATS keyword and skill recommendations will be.
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Link to="/" className="btn-secondary w-full sm:w-auto text-center order-2 sm:order-1">
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isProcessing || !file || !jobTitle.trim()}
                  className="btn-primary w-full sm:w-auto !py-3 !px-8 order-1 sm:order-2 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <span>Analyze Resume Now</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Upload;
