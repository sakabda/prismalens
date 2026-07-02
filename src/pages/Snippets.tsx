// import { useEffect, useState, useCallback, useRef } from "react";
// import {
//   Trash2,
//   Star,
//   Copy,
//   Search,
//   Import,
//   Download,
//   Plus,
// } from "lucide-react";
// import { toast } from "sonner";

// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";
// import Badge from "../components/ui/Badge";
// import EmptyState from "../components/ui/EmptyState";

// import {
//   getSnippets,
//   deleteSnippet,
//   toggleFavorite,
//   duplicateSnippet,
//   exportSnippets,
//   importSnippets,
//   saveSnippet,
// } from "../services/snippets";

// import type { Snippet } from "../types";
// import CreateSnippetModal from "../components/snippets/CreateSnippetModal";

// export default function Snippets() {
//   const [snippets, setSnippets] = useState<Snippet[]>([]);
//   const [search, setSearch] = useState("");
//   const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const reload = useCallback(() => {
//     setSnippets(getSnippets());
//   }, []);

//   useEffect(() => {
//     reload();
//   }, [reload]);

//   const handleDelete = useCallback(
//     (id: string) => {
//       deleteSnippet(id);
//       reload();
//       toast.success("Snippet deleted");
//     },
//     [reload],
//   );

//   const handleToggleFavorite = useCallback(
//     (id: string) => {
//       toggleFavorite(id);
//       reload();
//     },
//     [reload],
//   );

//   const handleDuplicate = useCallback(
//     (id: string) => {
//       duplicateSnippet(id);
//       reload();
//       toast.success("Snippet duplicated");
//     },
//     [reload],
//   );

//   const handleExport = useCallback(() => {
//     const json = exportSnippets();
//     const blob = new Blob([json], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "prismalens-snippets.json";
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("Snippets exported");
//   }, []);

//   const handleImport = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         const text = ev.target?.result as string;
//         const count = importSnippets(text);
//         reload();
//         toast.success(`Imported ${count} snippets`);
//       };
//       reader.readAsText(file);
//       e.target.value = "";
//     },
//     [reload],
//   );

//   const handleQuickSave = useCallback(() => {
//     const name = prompt("Snippet name:");
//     if (!name?.trim()) return;
//     const query = prompt("Prisma query:");
//     if (!query?.trim()) return;
//     saveSnippet(name.trim(), query.trim(), "prisma-to-sql");
//     reload();
//     toast.success("Snippet saved");
//   }, [reload]);

//   const filtered = snippets.filter((s) => {
//     const matchesSearch =
//       s.name.toLowerCase().includes(search.toLowerCase()) ||
//       s.query.toLowerCase().includes(search.toLowerCase()) ||
//       s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
//     const matchesFav = showFavoritesOnly ? s.isFavorite : true;
//     return matchesSearch && matchesFav;
//   });

//   return (
//     <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Saved Snippets</h1>
//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} saved
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".json"
//             onChange={handleImport}
//             className="hidden"
//           />
//           <Button variant="ghost" size="sm" onClick={handleQuickSave}>
//             <Plus size={14} />
//             New
//           </Button>
//           <Button variant="ghost" size="sm" onClick={handleExport}>
//             <Download size={14} />
//             Export
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <Import size={14} />
//             Import
//           </Button>
//         </div>
//       </div>

//       {/* Search + Filter */}
//       <div className="mb-4 flex items-center gap-3">
//         <div className="relative flex-1">
//           <Search
//             size={14}
//             className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
//           />
//           <input
//             type="text"
//             placeholder="Search snippets..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
//           />
//         </div>
//         <button
//           onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
//           className={cn(
//             "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
//             showFavoritesOnly ?
//               "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
//             : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
//           )}
//         >
//           <Star size={14} fill={showFavoritesOnly ? "currentColor" : "none"} />
//           Favorites
//         </button>
//       </div>

//       {filtered.length === 0 ?
//         <Card className="p-8">
//           <EmptyState
//             title={
//               search || showFavoritesOnly ? "No matches" : "No snippets yet"
//             }
//             description={
//               search || showFavoritesOnly ?
//                 "Try adjusting your search or filter."
//               : "Save your frequently used queries as snippets."
//             }
//             action={
//               !search && !showFavoritesOnly ?
//                 <Button size="sm" onClick={handleQuickSave}>
//                   <Plus size={14} />
//                   Create Snippet
//                 </Button>
//               : undefined
//             }
//           />
//         </Card>
//       : <div className="space-y-3">
//           {filtered.map((snippet) => (
//             <Card key={snippet.id} className="p-4">
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <h3 className="font-semibold">{snippet.name}</h3>
//                   <Badge
//                     variant={
//                       snippet.mode === "prisma-to-sql" ? "info" : "success"
//                     }
//                   >
//                     {snippet.mode === "prisma-to-sql" ?
//                       "Prisma → SQL"
//                     : "SQL → Prisma"}
//                   </Badge>
//                   {snippet.tags.map((tag) => (
//                     <Badge key={tag} variant="default">
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex items-center gap-0.5">
//                   <button
//                     onClick={() => {
//                       navigator.clipboard.writeText(snippet.query);
//                       toast.success("Copied");
//                     }}
//                     className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
//                     aria-label="Copy query"
//                   >
//                     <Copy size={14} />
//                   </button>
//                   <button
//                     onClick={() => handleToggleFavorite(snippet.id)}
//                     className={cn(
//                       "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
//                       snippet.isFavorite ?
//                         "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
//                       : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
//                     )}
//                     aria-label="Toggle favorite"
//                   >
//                     <Star
//                       size={14}
//                       fill={snippet.isFavorite ? "currentColor" : "none"}
//                     />
//                   </button>
//                   <button
//                     onClick={() => handleDuplicate(snippet.id)}
//                     className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
//                     aria-label="Duplicate"
//                   >
//                     <Copy size={14} />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(snippet.id)}
//                     className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
//                     aria-label="Delete"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               </div>
//               <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
//                 {snippet.query}
//               </pre>
//             </Card>
//           ))}
//         </div>
//       }
//     </div>
//   );
// }

// function cn(...inputs: (string | boolean | undefined | null)[]): string {
//   return inputs.filter(Boolean).join(" ");
// }


import { useEffect, useState, useCallback, useRef } from "react";
import {
  Trash2,
  Star,
  Copy,
  Search,
  Import,
  Download,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

import CreateSnippetModal from "../components/snippets/CreateSnippetModal";

import {
  getSnippets,
  deleteSnippet,
  toggleFavorite,
  duplicateSnippet,
  exportSnippets,
  importSnippets,
  saveSnippet,
} from "../services/snippets";

import type { Snippet } from "../types";

export default function Snippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    setSnippets(getSnippets());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSnippet(id);
      reload();
      toast.success("Snippet deleted");
    },
    [reload],
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
      reload();
    },
    [reload],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateSnippet(id);
      reload();
      toast.success("Snippet duplicated");
    },
    [reload],
  );

  const handleExport = useCallback(() => {
    const json = exportSnippets();

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "prismalens-snippets.json";

    a.click();

    URL.revokeObjectURL(url);

    toast.success("Snippets exported");
  }, []);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (ev) => {
        const text = ev.target?.result as string;

        const count = importSnippets(text);

        reload();

        toast.success(`Imported ${count} snippets`);
      };

      reader.readAsText(file);

      e.target.value = "";
    },
    [reload],
  );

  const filtered = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      snippet.query
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag
          .toLowerCase()
          .includes(search.toLowerCase()),
      );

    const matchesFavorite = showFavoritesOnly
      ? snippet.isFavorite
      : true;

    return matchesSearch && matchesFavorite;
  });

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Saved Snippets
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {snippets.length} snippet
              {snippets.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenCreateModal(true)}
            >
              <Plus size={14} />
              New
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
            >
              <Download size={14} />
              Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Import size={14} />
              Import
            </Button>
          </div>
        </div>

        {/* Search + Filter */}

        <div className="mb-4 flex items-center gap-3">
  <div className="relative flex-1">
    <Search
      size={14}
      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      placeholder="Search snippets..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </div>

  <button
    onClick={() =>
      setShowFavoritesOnly(!showFavoritesOnly)
    }
    className={cn(
      "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
      showFavoritesOnly
        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
    )}
  >
    <Star
      size={14}
      fill={showFavoritesOnly ? "currentColor" : "none"}
    />

    Favorites
  </button>
</div>

{/* Empty State */}

{filtered.length === 0 ? (
  <Card className="p-10">
    <EmptyState
      title={
        search || showFavoritesOnly
          ? "No snippets found"
          : "No snippets yet"
      }
      description={
        search || showFavoritesOnly
          ? "Try another search."
          : "Create your first Prisma snippet."
      }
      action={
        !search && !showFavoritesOnly ? (
          <Button
            size="sm"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={14} />
            Create Snippet
          </Button>
        ) : undefined
      }
    />
  </Card>
) : (
  <div className="space-y-4">
    {filtered.map((snippet) => (
      <Card
        key={snippet.id}
        className="p-5 transition-all hover:shadow-md"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">
                {snippet.name}
              </h3>

              <Badge
                variant={
                  snippet.mode === "prisma-to-sql"
                    ? "info"
                    : "success"
                }
              >
                {snippet.mode === "prisma-to-sql"
                  ? "Prisma → SQL"
                  : "SQL → Prisma"}
              </Badge>

              {snippet.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              {new Date(
                snippet.createdAt,
              ).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  snippet.query,
                );

                toast.success("Copied");
              }}
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Copy size={15} />
            </button>

            <button
              onClick={() =>
                handleToggleFavorite(snippet.id)
              }
              className={cn(
                "rounded-md p-2 transition",
                snippet.isFavorite
                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200",
              )}
            >
              <Star
                size={15}
                fill={
                  snippet.isFavorite
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

            <button
              onClick={() =>
                handleDuplicate(snippet.id)
              }
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Copy size={15} />
            </button>

            <button
              onClick={() =>
                handleDelete(snippet.id)
              }
              className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
{snippet.query}
        </pre>
      </Card>
    ))}
  </div>
        )}
              <CreateSnippetModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={(data) => {
          saveSnippet(
            data.name,
            data.query,
            data.mode,
          );

          reload();

          toast.success("Snippet saved");
        }}
      />
    </div>
  </>
);
}

function cn(
  ...inputs: (
    | string
    | boolean
    | undefined
    | null
  )[]
): string {
  return inputs
    .filter(Boolean)
    .join(" ");
}
