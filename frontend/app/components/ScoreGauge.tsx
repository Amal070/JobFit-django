import { useEffect, useRef, useState } from "react";

interface ScoreGaugeProps {
  score?: number;
  size?: "sm" | "md" | "lg";
}

const ScoreGauge = ({ score = 75, size = "md" }: ScoreGaugeProps) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  const percentage = Math.max(0, Math.min(100, score)) / 100;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const getScoreColor = (val: number) => {
    if (val >= 75) return "var(--color-success)";
    if (val >= 50) return "var(--color-warning)";
    return "var(--color-error)";
  };

  const getRating = (val: number) => {
    if (val >= 85) return "Excellent";
    if (val >= 70) return "Competitive";
    if (val >= 50) return "Average";
    return "Needs Revision";
  };

  const strokeColor = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-44 h-24">
        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
          {/* Background arc */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Active score arc */}
          <path
            ref={pathRef}
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={pathLength || 120}
            strokeDashoffset={(pathLength || 120) * (1 - percentage)}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {score}
            </span>
            <span className="text-xs font-semibold text-[var(--text-muted)]">/100</span>
          </div>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]"
      >
        {getRating(score)}
      </span>
    </div>
  );
};

export default ScoreGauge;