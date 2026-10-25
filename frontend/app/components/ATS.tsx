import React from "react";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const getStatus = (val: number) => {
    if (val >= 75) {
      return {
        title: "Strong ATS Compatibility",
        desc: "Your resume structure, typography, and keywords closely match what automated parsers expect.",
        badge: "Optimal",
        badgeClass: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
      };
    }
    if (val >= 50) {
      return {
        title: "Moderate ATS Compatibility",
        desc: "Automated filters will parse most sections, but key sections or terminology could be improved.",
        badge: "Action Recommended",
        badgeClass: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
      };
    }
    return {
      title: "ATS Optimization Needed",
      desc: "There are notable structural or keyword issues that may cause automated screening systems to drop your resume.",
      badge: "High Risk",
      badgeClass: "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]",
    };
  };

  const status = getStatus(score);

  return (
    <div className="card p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[var(--border-color)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Applicant Tracking System (ATS)
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}>
              {status.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {status.desc}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex-shrink-0">
          <span className="text-xs uppercase font-bold text-[var(--text-muted)]">ATS Score</span>
          <span className="text-base sm:text-lg font-black text-[var(--text-primary)]">{score}%</span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-2.5 sm:space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          ATS Screener Insights
        </h3>

        {suggestions && suggestions.length > 0 ? (
          <div className="space-y-2 sm:space-y-2.5">
            {suggestions.map((suggestion, index) => {
              const isGood = suggestion.type === "good";
              return (
                <div
                  key={index}
                  className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-sm"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isGood ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)] text-xs font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)] text-xs font-bold">
                        !
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                      {suggestion.tip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No ATS-specific flags found.</p>
        )}
      </div>
    </div>
  );
};

export default ATS;