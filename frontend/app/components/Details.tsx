import React from "react";
import type { Feedback } from "~/types";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordian";
import ScoreBadge from "./ScoreBagde";

interface TipItem {
  type: "good" | "improve";
  tip: string;
  explanation: string;
}

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
        <ScoreBadge score={categoryScore} />
      </div>
      <span className="text-sm font-semibold text-[var(--text-secondary)]">
        {categoryScore}<span className="text-xs text-[var(--text-muted)] font-normal">/100</span>
      </span>
    </div>
  );
};

const renderExplanation = (explanation: string) => {
  if (!explanation) return null;

  const rewriteMatch = explanation.match(/(?:Suggested Rewrite(?:\s*\(.*?\))?:?|Rewrite:?)\s*(.+)$/is);
  if (rewriteMatch && rewriteMatch.index !== undefined) {
    const mainText = explanation.substring(0, rewriteMatch.index).trim();
    const rewriteText = rewriteMatch[1].trim();

    return (
      <div className="space-y-2 mt-1">
        {mainText && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {mainText.replace(/\|\s*$/, "").trim()}
          </p>
        )}
        <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)]">
              Suggested Rewrite (X-Y-Z Formula)
            </span>
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed italic">
            "{rewriteText.replace(/^["']|["']$/g, "")}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
      {explanation}
    </p>
  );
};

const CategoryContent = ({ tips }: { tips: TipItem[] }) => {
  if (!tips || tips.length === 0) {
    return <p className="text-xs text-[var(--text-muted)] py-2">No detailed tips available for this section.</p>;
  }

  return (
    <div className="space-y-3 pt-1">
      {tips.map((item, index) => {
        const isGood = item.type === "good";
        return (
          <div
            key={index}
            className="p-4 rounded-xl border transition-colors bg-[var(--bg-surface-secondary)] border-[var(--border-color)]"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 ${
                  isGood
                    ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]"
                    : "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]"
                }`}
              >
                {isGood ? "✓" : "!"}
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {item.tip}
                </p>
                {renderExplanation(item.explanation)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Detailed Deep Dive
        </h2>
        <span className="text-xs text-[var(--text-muted)]">
          Click category to expand analysis
        </span>
      </div>

      <Accordion defaultOpen="tone-style" allowMultiple>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title="Content & Impact"
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Structure & Formatting"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title="Skills & Keywords"
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;