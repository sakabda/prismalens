import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

import type { QueryExample } from "../../types/example";
import { cn } from "../../utils/cn";
import { queryExamples } from "../../services/examples";
import type { ConverterMode } from "../../types";

interface ExampleSidebarProps {
  direction: ConverterMode;
  onSelect: (query: string) => void;
}

const CATEGORY_ORDER = [
  "basic",
  "crud",
  "filtering",
  "relations",
  "sorting",
  "pagination",
  "aggregation",
  "advanced",
];

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    basic: "Basic Queries",
    crud: "CRUD Operations",
    filtering: "Filtering",
    relations: "Relations",
    sorting: "Sorting",
    pagination: "Pagination",
    aggregation: "Aggregation",
    advanced: "Advanced",
  };

  return labels[cat] ?? cat;
}

export default function ExampleSidebar({
   direction,
  onSelect,
}: ExampleSidebarProps) {


  const [search, setSearch] = useState("");

  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["basic", "crud"]),
  );

  const grouped = useMemo(() => {
    const keyword = search.toLowerCase();

    const filtered = queryExamples.filter((ex) => {
      return (
        ex.name.toLowerCase().includes(keyword) ||
        ex.description.toLowerCase().includes(keyword) ||
        ex.category.toLowerCase().includes(keyword) ||
        ex.tags.some((tag) =>
          tag.toLowerCase().includes(keyword),
        )
      );
    });

    const groupedData: Record<string, QueryExample[]> = {};

    filtered.forEach((ex) => {
      if (!groupedData[ex.category]) {
        groupedData[ex.category] = [];
      }

      groupedData[ex.category].push(ex);
    });

    Object.values(groupedData).forEach((items) => {
      items.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groupedData;
  }, [search]);

  function toggleCat(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);

      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }

      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
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
        {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => {
          const examples = grouped[cat];

          return (
            <div key={cat} className="mb-1">
              <button
                onClick={() => toggleCat(cat)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {expandedCats.has(cat) ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}

                {getCategoryLabel(cat)}

                <span className="ml-auto text-[10px] font-normal normal-case text-slate-400">
                  {examples.length}
                </span>
              </button>

              {expandedCats.has(cat) && (
                <div className="ml-2 space-y-0.5">
                  {examples.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() =>
  onSelect(
    direction === "prisma-to-sql"
      ? ex.prisma
      : ex.sql
  )
}
                      title={ex.description}
                      className={cn(
                        "w-full rounded-md px-2.5 py-2 text-left transition-colors",
                        "hover:bg-blue-50 hover:text-blue-700",
                        "dark:hover:bg-blue-950 dark:hover:text-blue-400",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {ex.name}
                        </span>

                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            ex.difficulty === "Beginner" &&
                              "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                            ex.difficulty ===
                              "Intermediate" &&
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                            ex.difficulty ===
                              "Advanced" &&
                              "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                          )}
                        >
                          {ex.difficulty}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {ex.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-slate-400">
            No examples found.
          </p>
        )}
      </div>
    </div>
  );
}