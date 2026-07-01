import { Zap, CheckCircle2 } from "lucide-react";
import EmptyState from "../ui/EmptyState";

interface SuggestionPanelProps {
  suggestions: string[];
}

export default function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={32} />}
        title="Looking good"
        description="No optimization suggestions for this query."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Zap size={14} className="text-amber-500" />
        {suggestions.length} Suggestion{suggestions.length !== 1 ? "s" : ""}
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50"
          >
            <span className="mt-0.5 shrink-0 text-amber-500">
              <Zap size={14} />
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {suggestion}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
