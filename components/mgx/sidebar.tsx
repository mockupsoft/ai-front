import Link from "next/link";

import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";

export function MgxSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
      <div className="flex h-14 items-center px-6">
        <Link href="/mgx" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          TEM Dashboard
        </Link>
      </div>
      <div className="px-3 pb-6">
        <MgxSidebarNav />
      </div>
    </aside>
  );
}
