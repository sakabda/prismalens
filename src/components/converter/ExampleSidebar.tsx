import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import type { QueryExample } from "../../types";
import { cn } from "../../utils/cn";
import { queryExamples } from "../../services/examples";

interface ExampleSidebarProps {
  onSelect: (query: string) => void;
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    basic: "Basic Queries",
    filtering: "Filtering",
    relations: "Relations",
    pagination: "Pagination",
    sorting: "Sorting",
    aggregation: "Aggregation",
    crud: "CRUD Operations",
    advanced: "Advanced",
  };
  return labels[cat] ?? cat;
}

export default function ExampleSidebar({ onSelect }: ExampleSidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["basic", "filtering"]),
  );

  const filtered = queryExamples.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, QueryExample[]>>((acc, ex) => {
    const cat = ex.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  function toggleCat(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search examples..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {Object.entries(grouped).map(([cat, examples]) => (
          <div key={cat} className="mb-1">
            <button
              onClick={() => toggleCat(cat)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {expandedCats.has(cat) ?
                <ChevronDown size={12} />
              : <ChevronRight size={12} />}
              {getCategoryLabel(cat)}
              <span className="ml-auto text-[10px] font-normal normal-case text-slate-400">
                {examples.length}
              </span>
            </button>
            {expandedCats.has(cat) && (
              <div className="ml-2 space-y-0.5">
                {examples.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => onSelect(ex.query)}
                    className={cn(
                      "w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      "hover:bg-blue-50 hover:text-blue-700",
                      "dark:hover:bg-blue-950 dark:hover:text-blue-400",
                    )}
                    title={ex.description}
                  >
                    <span className="font-medium">{ex.name}</span>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {ex.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-slate-400">
            No examples found.
          </p>
        )}
      </div>
    </div>
  );
}
