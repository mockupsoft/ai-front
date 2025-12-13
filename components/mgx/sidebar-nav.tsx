"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationConfig } from "@/app/mgx/config/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/mgx") return pathname === href;
  return pathname.startsWith(href);
}

export function MgxSidebarNav({
  className,
  variant = "vertical",
}: {
  className?: string;
  variant?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  if (variant === "horizontal") {
    const allItems = navigationConfig.flatMap((group) => group.items);
    return (
      <nav
        className={cn("flex flex-wrap items-center gap-2", className)}
        aria-label="MGX"
      >
        {allItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium",
                "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                active &&
                  "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("space-y-4", className)} aria-label="MGX">
      {navigationConfig.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {group.label && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {group.label}
            </h3>
          )}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                    active &&
                      "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
