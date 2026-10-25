import React, { useState } from "react";
import { Link } from "react-router";
import type { Resume } from "~/types";
import { deleteResume } from "~/lib/api";

interface ResumeCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  resume: { id, companyName, jobTitle, feedback },
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const score = feedback?.overallScore ?? null;

  const getScoreTheme = (val: number | null) => {
    if (val === null) return { text: "text-[var(--text-muted)]", bg: "bg-[var(--bg-surface-secondary)]", label: "Pending" };
    if (val >= 75) return { text: "text-[var(--color-success)]", bg: "bg-[var(--color-success-bg)]", border: "border-[var(--color-success-border)]", label: "Strong Match" };
    if (val >= 50) return { text: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning-bg)]", border: "border-[var(--color-warning-border)]", label: "Moderate" };
    return { text: "text-[var(--color-error)]", bg: "bg-[var(--color-error-bg)]", border: "border-[var(--color-error-border)]", label: "Needs Work" };
  };

  const scoreTheme = getScoreTheme(score);

  const handleDelete = async () => {
    if (!window.confirm(`Delete resume analysis for ${companyName || "this role"}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteResume(id);
      onDelete?.(id);
    } catch (err) {
      alert((err as Error).message || "Failed to delete resume");
      setIsDeleting(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 flex flex-col justify-between hover:border-[var(--text-primary)] transition-all duration-200 group">
      <div>
        {/* Top Header: Company/Role + Score Badge */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Target Company
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate mt-0.5">
              {companyName || "General Application"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 sm:mt-1">
              {jobTitle || "Resume Assessment"}
            </p>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border ${scoreTheme.bg} ${scoreTheme.border || "border-[var(--border-color)]"}`}
            >
              <span className={`text-base sm:text-lg font-black leading-none ${scoreTheme.text}`}>
                {score !== null ? score : "—"}
              </span>
              <span className="text-[9px] font-semibold text-[var(--text-muted)] mt-0.5">
                /100
              </span>
            </div>
            <span className={`text-[10px] font-semibold mt-1 ${scoreTheme.text}`}>
              {scoreTheme.label}
            </span>
          </div>
        </div>

        {/* Category Mini Indicators */}
        {feedback && (
          <div className="grid grid-cols-2 gap-2 my-3 sm:my-4 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)]">
              <span className="text-[11px] sm:text-xs">ATS Score</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {feedback.ATS?.score ?? "—"}%
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)]">
              <span className="text-[11px] sm:text-xs">Skills Match</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {feedback.skills?.score ?? "—"}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-[var(--border-color)]">
        <Link
          to={`/resume/${id}`}
          className="btn-primary !text-xs !py-2.5 flex-1 text-center min-h-[38px]"
        >
          View Full Report
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete resume"
          title="Delete resume analysis"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error-border)] hover:bg-[var(--color-error-bg)] transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;