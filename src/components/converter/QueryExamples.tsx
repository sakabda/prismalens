import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { queryExamples } from "../../services/examples";
import type { QueryExample } from "../../types";
import Badge from "../ui/Badge";

interface QueryExamplesProps {
  onSelect: (query: string) => void;
}

export default function QueryExamples({ onSelect }: QueryExamplesProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(queryExamples.map((example) => example.category))],
    [],
  );
  const filtered = useMemo(() => {
    let items = queryExamples;

    if (activeCategory !== "All") {
      items = items.filter((e) => e.category === activeCategory);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.description.toLowerCase().includes(lower),
      );
    }

    return items;
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          placeholder="Search examples..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-9 pr-3 py-2
            bg-bg-secondary border border-border rounded-lg
            text-sm text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
          "
          aria-label="Search examples"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-2.5 py-1 rounded-md text-xs font-medium transition-colors
              ${
                activeCategory === cat ?
                  "bg-accent text-white"
                : "bg-bg-secondary text-text-secondary hover:bg-surface-hover"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Example List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 ?
          <p className="text-sm text-text-tertiary py-4 text-center">
            No examples match your search.
          </p>
        : filtered.map((example) => (
            <ExampleItem
              key={example.name}
              example={example}
              onSelect={onSelect}
            />
          ))
        }
      </div>
    </div>
  );
}

function ExampleItem({
  example,
  onSelect,
}: {
  example: QueryExample;
  onSelect: (query: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(example.query)}
      className="
        w-full text-left px-3 py-2.5 rounded-lg
        hover:bg-surface-hover
        transition-colors duration-100
        group
      "
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
          {example.name}
        </span>
        <Badge variant="default" className="shrink-0 text-[10px]">
          {example.category}
        </Badge>
      </div>
      <p className="text-xs text-text-tertiary line-clamp-1">
        {example.description}
      </p>
    </button>
  );
}
