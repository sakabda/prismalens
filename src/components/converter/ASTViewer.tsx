import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { PrismaQueryAST } from "../../types";
import { cn } from "../../utils/cn";
import EmptyState from "../ui/EmptyState";
import CopyButton from "../CopyButton";

interface ASTViewerProps {
  ast: PrismaQueryAST | null;
}

function TreeNode({
  label,
  value,
  depth = 0,
}: {
  label: string;
  value: unknown;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);

  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
            "w-full",
          )}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {expanded ?
            <ChevronDown size={12} className="shrink-0 text-slate-400" />
          : <ChevronRight size={12} className="shrink-0 text-slate-400" />}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {label}
          </span>
          <span className="text-xs text-slate-400">
            {"{"}
            {entries.length}
            {"}"}
          </span>
        </button>
        {expanded && (
          <div>
            {entries.map(([k, v]) => (
              <TreeNode key={k} label={k} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isArray) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
            "w-full",
          )}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {expanded ?
            <ChevronDown size={12} className="shrink-0 text-slate-400" />
          : <ChevronRight size={12} className="shrink-0 text-slate-400" />}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {label}
          </span>
          <span className="text-xs text-slate-400">
            {"["}
            {(value as unknown[]).length}
            {"]"}
          </span>
        </button>
        {expanded && (
          <div>
            {(value as unknown[]).map((item, i) => (
              <TreeNode
                key={i}
                label={`[${i}]`}
                value={item}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-1 py-0.5 text-sm"
      style={{ paddingLeft: `${depth * 16 + 20}px` }}
    >
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="text-amber-600 dark:text-amber-400">
        {typeof value === "string" ? `"${value}"` : String(value)}
      </span>
    </div>
  );
}

export default function ASTViewer({ ast }: ASTViewerProps) {
  if (!ast) {
    return (
      <EmptyState
        title="No AST available"
        description="Convert a query to see its parsed structure."
      />
    );
  }

  const jsonString = JSON.stringify(ast, null, 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Query Structure</h4>
        <CopyButton value={jsonString} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <TreeNode label="root" value={ast} />
      </div>
    </div>
  );
}
