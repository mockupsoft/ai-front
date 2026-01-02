"use client";

import { Wifi } from "lucide-react";
import type { WorkspaceHealth } from "@/lib/types/workspace";

interface HealthIndicatorProps {
  health: WorkspaceHealth | null;
  size?: "sm" | "md" | "lg";
}

function HealthIndicator({ health, size = "sm" }: HealthIndicatorProps) {
  // This component is loaded with dynamic import and ssr: false
  // So it will never be rendered on the server
  if (!health) return null;

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusColors = {
    healthy: "bg-green-500 text-green-500",
    degraded: "bg-yellow-500 text-yellow-500",
    offline: "bg-red-500 text-red-500",
  };

  const wsStatusColors = {
    connected: "text-green-500",
    disconnected: "text-red-500",
    connecting: "text-yellow-500 animate-pulse",
  };

  return (
    <div className="flex items-center gap-1">
      <div 
        className={`${sizeClasses[size]} rounded-full ${statusColors[health.status]} animate-pulse`} 
        title={`API Status: ${health.status}`}
      />
      {health.wsStatus && (
        <span title={`WS Status: ${health.wsStatus}`}>
          <Wifi className={`h-3 w-3 ${wsStatusColors[health.wsStatus]}`} />
        </span>
      )}
    </div>
  );
}

export default HealthIndicator;
