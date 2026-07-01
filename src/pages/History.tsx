import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ArrowRightLeft, Search } from "lucide-react";
import { toast } from "sonner";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import CopyButton from "../components/CopyButton";

import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/history";

import type { HistoryItem } from "../types";

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = useCallback(() => {
    if (!confirm("Clear all history?")) return;
    clearHistory();
    setHistory([]);
    toast.success("History cleared");
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
    toast.success("Item deleted");
  }, []);

  const filtered = history.filter(
    (item) =>
      item.prismaQuery.toLowerCase().includes(search.toLowerCase()) ||
      item.sqlQuery.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Query History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {history.length} conversion{history.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {history.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClear}>
              <Trash2 size={14} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ?
        <Card className="p-8">
          <EmptyState
            title={search ? "No results" : "No history yet"}
            description={
              search ?
                "Try a different search term."
              : "Converted queries will appear here automatically."
            }
          />
        </Card>
      : <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={14} className="text-slate-400" />
                  <Badge
                    variant={item.mode === "prisma-to-sql" ? "info" : "success"}
                  >
                    {item.mode === "prisma-to-sql" ?
                      "Prisma → SQL"
                    : "SQL → Prisma"}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CopyButton value={item.sqlQuery} />
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {item.prismaQuery}
                </pre>
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {item.sqlQuery}
                </pre>
              </div>
              {item.analysis && (
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Score: <strong>{item.analysis.score}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Complexity: <strong>{item.analysis.complexity}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {item.analysis.conditions} condition
                    {item.analysis.conditions !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
