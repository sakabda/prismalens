import { useTheme } from "next-themes";
import { Database, Moon, Sun, Command } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../utils/cn";

const NAV_LINKS = [
  { to: "/converter", label: "Converter" },
  { to: "/history", label: "History" },
  { to: "/snippets", label: "Snippets" },
] as const;

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
            <Database size={14} />
          </div>
          PrismaLens
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                location.pathname === link.to ?
                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ?
                <Sun size={15} />
              : <Moon size={15} />}
            </button>

            <button
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Keyboard shortcuts"
            >
              <Command size={12} />
              <span className="hidden sm:inline">K</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
