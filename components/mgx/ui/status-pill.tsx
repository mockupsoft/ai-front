import * as React from "react";

import { cn } from "@/lib/utils";

export type StatusPillVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

const variants: Record<StatusPillVariant, string> = {
  neutral:
    "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300",
  info: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  success:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 ring-amber-500/25 dark:text-amber-300",
  danger:
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
};

export type StatusPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusPillVariant;
};

export function StatusPill({
  className,
  variant = "neutral",
  ...props
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
