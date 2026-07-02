// import { useTheme } from "next-themes";
// import { Database, Moon, Sun, Command,  Menu,
//   X,} from "lucide-react";
// import { Link, useLocation } from "react-router-dom";
// import { cn } from "../utils/cn";
// import { useState } from "react";



// const NAV_LINKS = [
//   { to: "/converter", label: "Converter" },
//   { to: "/history", label: "History" },
//   { to: "/snippets", label: "Snippets" },
// ] as const;

// export default function Navbar() {
//   const { resolvedTheme, setTheme } = useTheme();
//   const location = useLocation();

//   function toggleTheme() {
//     setTheme(resolvedTheme === "dark" ? "light" : "dark");
//   }

//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
//       <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 sm:px-6">
//         <Link
//           to="/"
//           className="flex items-center gap-2 font-bold text-base tracking-tight"
//         >
//           <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
//             <Database size={14} />
//           </div>
//           PrismaLens
//         </Link>

//         <nav className="flex items-center gap-1">
//           {NAV_LINKS.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               className={cn(
//                 "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
//                 location.pathname === link.to ?
//                   "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
//                 : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
//               )}
//             >
//               {link.label}
//             </Link>
//           ))}

//           <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
//             <button
//               onClick={toggleTheme}
//               className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
//               aria-label="Toggle theme"
//             >
//               {resolvedTheme === "dark" ?
//                 <Sun size={15} />
//               : <Moon size={15} />}
//             </button>

//             <button
//               className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
//               aria-label="Keyboard shortcuts"
//             >
//               <Command size={12} />
//               <span className="hidden sm:inline">K</span>
//             </button>
//           </div>
//         </nav>
//       </div>
//     </header>
//   );
// }



import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Database,
  Moon,
  Sun,
  Command,
  Menu,
  X,
} from "lucide-react";
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

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function toggleTheme() {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark"
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-base tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <Database size={16} />
            </div>

            <span>PrismaLens</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle Theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
              </button>

              {/* Shortcut */}
              <button
                className="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Command size={12} />
                <span>K</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="rounded-md p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden",
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        )}
        onClick={() =>
          setMobileMenuOpen(false)
        }
      />

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-72 transform border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 md:hidden",
          mobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <Database size={16} />
            </div>

            <span className="font-bold">
              PrismaLens
            </span>
          </div>

          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className={cn(
                "rounded-lg px-4 py-3 font-medium transition",
                location.pathname === link.to
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-slate-200 dark:border-slate-800" />

        {/* Theme */}
        <div className="p-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}

            <span>
              {resolvedTheme === "dark"
                ? "Light Mode"
                : "Dark Mode"}
            </span>
          </button>

          <button
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Command size={18} />
            <span>Keyboard Shortcuts</span>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 w-full px-6 text-center text-xs text-slate-500">
          PrismaLens v1.0.0
        </div>
      </aside>
    </>
  );
}
