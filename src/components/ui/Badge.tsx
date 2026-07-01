import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300":
            variant === "default",
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400":
            variant === "success",
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400":
            variant === "warning",
          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400":
            variant === "danger",
          "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400":
            variant === "info",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
