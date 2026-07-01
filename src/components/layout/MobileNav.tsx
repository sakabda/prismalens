import { Menu } from "lucide-react";

interface MobileNavProps {
  onMenuClick: () => void;
}

export default function MobileNav({ onMenuClick }: MobileNavProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-surface border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <span className="font-bold text-sm">PrismaLens</span>
      </div>

      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
