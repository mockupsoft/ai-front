"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { ChevronRight } from "lucide-react";

import { navigationConfig } from "@/app/mgx/config/navigation";
import { cn } from "@/lib/utils";

export function MgxBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  const allItems = navigationConfig.flatMap((group) => group.items);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

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
          <Fragment key={crumb.href}>
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
