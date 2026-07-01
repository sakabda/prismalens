import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../utils/cn";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export default function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
        "border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        "dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        copied &&
          "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400",
        className,
      )}
      aria-label="Copy to clipboard"
    >
      {copied ?
        <Check size={13} />
      : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
