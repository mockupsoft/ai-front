"use client";

import type { WorkflowStepType } from "@/lib/types/workflows";
import { Button } from "@/components/mgx/ui/button";

const STEP_TYPES: { type: WorkflowStepType; label: string; description: string }[] = [
  {
    type: "agent_task",
    label: "Agent task",
    description: "Run a task using an assigned agent.",
  },
  {
    type: "script",
    label: "Script",
    description: "Execute a script / command step.",
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch based on a boolean expression.",
  },
  {
    type: "http_request",
    label: "HTTP request",
    description: "Call an external API endpoint.",
  },
  {
    type: "delay",
    label: "Delay",
    description: "Wait for a duration before continuing.",
  },
];

export interface WorkflowStepPaletteProps {
  onAddStep: (type: WorkflowStepType) => void;
}

export function WorkflowStepPalette({ onAddStep }: WorkflowStepPaletteProps) {
  return (
    <div className="space-y-3" aria-label="Step palette">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Steps
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Drag onto the canvas or click Add.
        </p>
      </div>

      <div className="space-y-2">
        {STEP_TYPES.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                "application/x-workflow-step-type",
                item.type,
              );
              event.dataTransfer.effectAllowed = "copy";
            }}
            className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => onAddStep(item.type)}
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
