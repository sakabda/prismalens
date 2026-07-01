import type { Snippet } from "../types";

const STORAGE_KEY = "prismalens_snippets";

export function getSnippets(): Snippet[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Snippet[];
  } catch {
    return [];
  }
}

export function saveSnippet(
  name: string,
  query: string,
  mode: "prisma-to-sql" | "sql-to-prisma",
  tags: string[] = [],
): void {
  const snippets = getSnippets();
  snippets.unshift({
    id: crypto.randomUUID(),
    name,
    query,
    mode,
    tags,
    isFavorite: false,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function deleteSnippet(id: string): void {
  const snippets = getSnippets();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(snippets.filter((s) => s.id !== id)),
  );
}

export function toggleFavorite(id: string): void {
  const snippets = getSnippets();
  const updated = snippets.map((s) =>
    s.id === id ? { ...s, isFavorite: !s.isFavorite } : s,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function duplicateSnippet(id: string): void {
  const snippets = getSnippets();
  const original = snippets.find((s) => s.id === id);
  if (!original) return;
  const dup: Snippet = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (copy)`,
    createdAt: new Date().toISOString(),
  };
  const idx = snippets.findIndex((s) => s.id === id);
  snippets.splice(idx + 1, 0, dup);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function exportSnippets(): string {
  return JSON.stringify(getSnippets(), null, 2);
}

export function importSnippets(json: string): number {
  try {
    const imported = JSON.parse(json) as Snippet[];
    if (!Array.isArray(imported)) return 0;
    const existing = getSnippets();
    const newSnippets = imported.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
    }));
    const merged = [...newSnippets, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return newSnippets.length;
  } catch {
    return 0;
  }
}
