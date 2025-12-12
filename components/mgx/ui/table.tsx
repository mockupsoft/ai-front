import * as React from "react";

import { cn } from "@/lib/utils";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        "bg-white dark:bg-zinc-950",
        className,
      )}
      {...props}
    />
  </div>
));

Table.displayName = "Table";

export const THead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-zinc-200 dark:border-zinc-800", className)}
    {...props}
  />
));

THead.displayName = "THead";

export const TBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-zinc-200 dark:divide-zinc-800", className)}
    {...props}
  />
));

TBody.displayName = "TBody";

export const Tr = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
      className,
    )}
    {...props}
  />
));

Tr.displayName = "Tr";

export const Th = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-4 text-left align-middle font-medium text-zinc-600 dark:text-zinc-400",
      className,
    )}
    {...props}
  />
));

Th.displayName = "Th";

export const Td = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3 align-middle text-zinc-900 dark:text-zinc-50", className)}
    {...props}
  />
));

Td.displayName = "Td";
