import Link from "next/link";

import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";

export function MgxSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
      <div className="flex h-14 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link
          href="/mgx"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <span className="text-xs font-bold">MGX</span>
          </div>
          <span>MGX Dashboard</span>
        </Link>
      </div>
      <div className="px-3 py-6">
        <MgxSidebarNav />
      </div>
    </aside>
  );
}
