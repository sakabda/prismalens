import { NavLink, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  Clock,
  Bookmark,
  Zap,
  X,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import Tooltip from "../ui/Tooltip";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    to: "/converter",
    label: "Converter",
    icon: ArrowLeftRight,
    shortcut: "⌘K",
  },
  { to: "/history", label: "History", icon: Clock, shortcut: "⌘H" },
  { to: "/snippets", label: "Snippets", icon: Bookmark, shortcut: "⌘S" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { resolvedTheme, toggle } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full
          w-64 bg-surface border-r border-border
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Database size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-text-primary group-hover:text-accent transition-colors">
              PrismaLens
            </span>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-surface-hover text-text-tertiary"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Tools
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Tooltip
                key={item.to}
                content={item.shortcut ?? item.label}
                side="right"
              >
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive ?
                        "bg-accent-muted text-accent"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-border shrink-0 space-y-1">
          <button
            onClick={toggle}
            className="
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-sm font-medium text-text-secondary
              hover:bg-surface-hover hover:text-text-primary
              transition-all duration-150
            "
          >
            <Zap size={18} />
            <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <div className="px-3 pt-2">
            <p className="text-[11px] text-text-tertiary">PrismaLens v0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
