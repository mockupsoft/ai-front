import type { ComponentType } from "react";

import {
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings,
  Trophy,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const navigationConfig: NavGroup[] = [
  {
    items: [
      {
        href: "/mgx",
        label: "Overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/mgx/tasks",
        label: "Tasks",
        icon: ListChecks,
      },
      {
        href: "/mgx/results",
        label: "Results",
        icon: Trophy,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        href: "/mgx/monitoring",
        label: "Monitoring",
        icon: Gauge,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/mgx/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];
