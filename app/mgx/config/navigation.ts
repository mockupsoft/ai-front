import type { ComponentType } from "react";

import {
  Bot,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings,
  Trophy,
  Workflow,
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
      {
        href: "/mgx/workflows",
        label: "Workflows",
        icon: Workflow,
      },
      {
        href: "/mgx/agents",
        label: "Agents",
        icon: Bot,
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
