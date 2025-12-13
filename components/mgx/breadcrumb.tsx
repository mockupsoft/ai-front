"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useContext } from "react";

import { ChevronRight } from "lucide-react";

import { navigationConfig } from "@/app/mgx/config/navigation";
import { WorkspaceContext } from "@/lib/mgx/workspace/workspace-context";
import { cn } from "@/lib/utils";

export function MgxBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  
  // Get workspace context safely - it may not be available during SSR/build
  const context = useContext(WorkspaceContext);
  const { 
    currentWorkspace, 
    currentProject, 
    isLoadingWorkspaces, 
    isLoadingProjects 
  } = context ?? {
    currentWorkspace: null,
    currentProject: null,
    isLoadingWorkspaces: false,
    isLoadingProjects: false,
  };

  const allItems = navigationConfig.flatMap((group) => group.items);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

  // Add workspace context to breadcrumbs if available
  if (currentWorkspace || isLoadingWorkspaces) {
    breadcrumbs.push({
      label: (
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-zinc-400" />
          {isLoadingWorkspaces ? "Loading..." : currentWorkspace?.name || "No Workspace"}
        </span>
      ),
      href: "/mgx",
    });

    if (currentProject || isLoadingProjects) {
      breadcrumbs.push({
        label: (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-zinc-300" />
            {isLoadingProjects ? "Loading..." : currentProject?.name || "No Project"}
          </span>
        ),
        href: "/mgx",
      });
    }
  }

  breadcrumbs.push({ label: "Home", href: "/mgx" });

  if (segments.length > 1) {
    for (let i = 1; i < segments.length; i++) {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const segment = segments[i];

      const navItem = allItems.find((item) => item.href === href);

      if (navItem) {
        breadcrumbs.push({ label: navItem.label, href });
      } else {
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        breadcrumbs.push({ label, href });
      }
    }
  }

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Fragment key={typeof crumb.label === "string" ? crumb.label : index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
            )}
            {isLast ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
