import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          size === "sm" ? "h-8 px-3 text-sm" : "h-9 px-4 text-sm",
          variant === "primary" &&
            "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
          variant === "secondary" &&
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800",
          variant === "ghost" &&
            "bg-transparent text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
