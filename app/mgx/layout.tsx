import type { Metadata } from "next";

import { MgxBreadcrumb } from "@/components/mgx/breadcrumb";
import { MgxHeader } from "@/components/mgx/header";
import { MgxSidebar } from "@/components/mgx/sidebar";
import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";

export const metadata: Metadata = {
  title: "MGX Dashboard",
  description: "TEM dashboard shell",
};

export default function MgxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="flex min-h-screen">
        <MgxSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <MgxHeader />

          <div className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <MgxSidebarNav variant="horizontal" />
          </div>

          <div className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <MgxBreadcrumb />
          </div>

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
