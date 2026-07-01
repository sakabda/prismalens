import type { HistoryItem, QueryAnalysis } from "../types";

const STORAGE_KEY = "prismalens_history";
const MAX_ITEMS = 100;

export function saveHistory(
  prismaQuery: string,
  sqlQuery: string,
  mode: "prisma-to-sql" | "sql-to-prisma",
  analysis: QueryAnalysis | null,
): void {
  const existing = getHistory();
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    prismaQuery,
    sqlQuery,
    mode,
    analysis,
    createdAt: new Date().toISOString(),
  };
  const updated = [item, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryItem[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as HistoryItem[];
  } catch {
    return [];
  }
}

export function deleteHistoryItem(id: string): void {
  const existing = getHistory();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing.filter((item) => item.id !== id)),
  );
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
