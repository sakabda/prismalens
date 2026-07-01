import type { QueryAnalysis } from "../../types";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface AnalysisPanelProps {
  analysis: QueryAnalysis;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-500"
    : score >= 50 ? "text-amber-500"
    : "text-red-500";
  const bgColor =
    score >= 80 ? "stroke-emerald-500"
    : score >= 50 ? "stroke-amber-500"
    : "stroke-red-500";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={bgColor}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${color}`}>{score}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && (
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const complexityColor = {
    Low: "success" as const,
    Medium: "warning" as const,
    High: "danger" as const,
    "Very High": "danger" as const,
  };

  const costColor = {
    Low: "success" as const,
    Medium: "warning" as const,
    High: "danger" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <ScoreRing score={analysis.score} />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={complexityColor[analysis.complexity]}>
              {analysis.complexity} Complexity
            </Badge>
            <Badge variant={costColor[analysis.estimatedCost]}>
              {analysis.estimatedCost} Cost
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {analysis.score >= 80 ?
              "This query is well-optimized."
            : analysis.score >= 50 ?
              "This query has room for improvement."
            : "This query has significant performance concerns."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Conditions" value={analysis.conditions} />
        <MetricCard label="Tables" value={analysis.tables} />
        <MetricCard label="Joins" value={analysis.joins} />
        <MetricCard label="Nested Depth" value={analysis.nestedDepth} />
      </div>

      {analysis.warnings.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Warnings</h4>
          <ul className="space-y-1.5">
            {analysis.warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                {w}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.bottlenecks.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-semibold">Potential Bottlenecks</h4>
          <ul className="space-y-1.5">
            {analysis.bottlenecks.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <span className="mt-0.5 shrink-0">🔴</span>
                {b}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
