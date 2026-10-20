import React from "react";

interface ScoreCircleProps {
  score?: number;
  size?: number;
  strokeWidth?: number;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score = 75,
  size = 80,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference * (1 - normalized / 100);

  const getStrokeColor = (val: number) => {
    if (val >= 75) return "var(--color-success)";
    if (val >= 50) return "var(--color-warning)";
    return "var(--color-error)";
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-[var(--text-primary)] leading-none">{score}</span>
        <span className="text-[9px] text-[var(--text-muted)]">/100</span>
      </div>
    </div>
  );
};

export default ScoreCircle;