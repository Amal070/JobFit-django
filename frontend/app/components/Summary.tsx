import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBagde";
import type { Feedback } from "~/types";

interface CategoryRowProps {
  title: string;
  score: number;
}

const CategoryRow = ({ title, score }: CategoryRowProps) => {
  const getScoreColor = (val: number) => {
    if (val >= 75) return "text-[var(--color-success)]";
    if (val >= 50) return "text-[var(--color-warning)]";
    return "text-[var(--color-error)]";
  };

  const getProgressColor = (val: number) => {
    if (val >= 75) return "bg-[var(--color-success)]";
    if (val >= 50) return "bg-[var(--color-warning)]";
    return "bg-[var(--color-error)]";
  };

  return (
    <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">{title}</span>
          <ScoreBadge score={score} />
        </div>
        <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${getScoreColor(score)}`}>
          {score}<span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">/100</span>
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
        <div
          className={`h-full rounded-full ${getProgressColor(score)} transition-all duration-700`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="card p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 pb-5 sm:pb-6 border-b border-[var(--border-color)]">
        <ScoreGauge score={feedback.overallScore} />

        <div className="text-center sm:text-left space-y-1.5 sm:space-y-2 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Overall ATS Assessment
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Your composite score represents overall ATS alignment, structural clarity, relevant keyword density, and qualitative impact.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Category Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <CategoryRow title="Tone & Style" score={feedback.toneAndStyle.score} />
          <CategoryRow title="Content Impact" score={feedback.content.score} />
          <CategoryRow title="Structure & Layout" score={feedback.structure.score} />
          <CategoryRow title="Skills Alignment" score={feedback.skills.score} />
        </div>
      </div>
    </div>
  );
};

export default Summary;