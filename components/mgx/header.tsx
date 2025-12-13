import { Bell, Search } from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import { WorkspaceSelector } from "@/lib/mgx/workspace/workspace-selector";

function getEnvironmentInfo() {
  const env = process.env.NODE_ENV;
  const customEnv = process.env.NEXT_PUBLIC_ENV;

  if (customEnv) {
    return {
      label: customEnv.toUpperCase(),
      variant: customEnv === "production" ? "default" : "warning",
    };
  }

  if (env === "development") {
    return { label: "DEV", variant: "warning" as const };
  }

  if (env === "production") {
    return { label: "PROD", variant: "default" as const };
  }

  return { label: env?.toUpperCase() ?? "LOCAL", variant: "warning" as const };
}

export function MgxHeader() {
  const envInfo = getEnvironmentInfo();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="flex h-14 items-center justify-between gap-4 px-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              placeholder="Search (placeholder)"
              aria-label="Search"
            />
          </div>
          <WorkspaceSelector />
        </div>

        <div className="flex items-center gap-3">
          {envInfo.variant === "warning" && (
            <div className="hidden rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 sm:block">
              {envInfo.label}
            </div>
          )}
          {envInfo.variant === "default" && (
            <div className="hidden rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:block">
              {envInfo.label}
            </div>
          )}

          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Admin
              </p>
              <p className="text-xs text-zinc-500">mgx@example.com</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </header>
  );
}
