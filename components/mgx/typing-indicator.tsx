import * as React from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-75 dark:bg-zinc-600" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-150 dark:bg-zinc-600" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-300 dark:bg-zinc-600" />
    </div>
  );
}
