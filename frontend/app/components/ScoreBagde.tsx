import React from "react";

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeClass = "";
  let badgeText = "";

  if (score >= 75) {
    badgeClass = "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]";
    badgeText = "Strong";
  } else if (score >= 50) {
    badgeClass = "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]";
    badgeText = "Moderate";
  } else {
    badgeClass = "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]";
    badgeText = "Needs Revision";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
      {badgeText}
    </span>
  );
};

export default ScoreBadge;