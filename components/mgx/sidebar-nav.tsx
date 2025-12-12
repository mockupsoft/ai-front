"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ComponentType } from "react";

import { Gauge, LayoutDashboard, ListChecks, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/mgx", label: "Overview", icon: LayoutDashboard },
  { href: "/mgx/tasks", label: "Tasks", icon: ListChecks },
  { href: "/mgx/metrics", label: "Metrics", icon: Gauge },
  { href: "/mgx/results", label: "Results", icon: Trophy },
];

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

  return (
    <nav
      className={cn(
        variant === "vertical"
          ? "flex flex-col gap-1"
          : "flex flex-wrap items-center gap-2",
        className,
      )}
      aria-label="MGX"
    >
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium",
              variant === "vertical" ? "px-3 py-2" : "px-3 py-1.5",
              "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
              active &&
                "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
