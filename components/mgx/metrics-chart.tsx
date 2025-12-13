"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { cn } from "@/lib/utils";

export type MetricsChartProps = {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

export function MetricsChart({ title, description, className, children }: MetricsChartProps) {
  return (
    <Card className={cn("h-72", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </CardHeader>
      <CardContent className="h-[220px] pt-0">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
