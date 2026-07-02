import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../ui/Button";

export interface CreateSnippetData {
  name: string;
  query: string;
  mode: "prisma-to-sql" | "sql-to-prisma";
  tags: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSnippetData) => void;
}

export default function CreateSnippetModal({
  open,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState("");
  const [mode, setMode] = useState<
    "prisma-to-sql" | "sql-to-prisma"
  >("prisma-to-sql");

  useEffect(() => {
    if (!open) {
      setName("");
      setQuery("");
      setTags("");
      setMode("prisma-to-sql");
    }
  }, [open]);

  if (!open) return null;

  function handleSave() {
    if (!name.trim()) return;

    if (!query.trim()) return;

    onSave({
      name: name.trim(),
      query: query.trim(),
      mode,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-bold">
            Create Snippet
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Snippet Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Find Admin Users"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Conversion Mode
            </label>

            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target.value as
                    | "prisma-to-sql"
                    | "sql-to-prisma"
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="prisma-to-sql">
                Prisma → SQL
              </option>

              <option value="sql-to-prisma">
                SQL → Prisma
              </option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
              placeholder="auth,user,admin"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />

            <p className="mt-1 text-xs text-slate-500">
              Separate multiple tags with commas.
            </p>
          </div>

          {/* Query */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Query
            </label>

            <textarea
              rows={10}
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="prisma.user.findMany({...})"
              className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSave}>
            Save Snippet
          </Button>
        </div>
      </div>
    </>
  );
}