"use client";

import { useMemo, useState } from "react";

import type { AgentDefinition } from "@/lib/types";
import type { WorkflowStep, WorkflowValidationIssue } from "@/lib/types/workflows";
import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseRecord(value: string): {
  value?: Record<string, string>;
  error?: string;
} {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record: Record<string, string> = {};
      for (const [key, raw] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof raw === "string") {
          record[key] = raw;
        } else {
          record[key] = JSON.stringify(raw);
        }
      }
      return { value: record };
    }
    return { error: "Bindings must be a JSON object." };
  } catch {
    return { error: "Invalid JSON." };
  }
}

export interface WorkflowStepPanelProps {
  step?: WorkflowStep;
  allSteps: WorkflowStep[];
  agentDefinitions?: AgentDefinition[];
  issues?: WorkflowValidationIssue[];
  linkingFromStepId?: string | null;
  onStartLinking: (stepId: string) => void;
  onCancelLinking: () => void;
  onUpdateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  onDeleteStep: (stepId: string) => void;
}

export function WorkflowStepPanel({
  step,
  allSteps,
  agentDefinitions,
  issues,
  linkingFromStepId,
  onStartLinking,
  onCancelLinking,
  onUpdateStep,
  onDeleteStep,
}: WorkflowStepPanelProps) {
  const [bindingsDraft, setBindingsDraft] = useState<string>(() =>
    stringifyJson(step?.bindings ?? {}),
  );
  const [bindingsError, setBindingsError] = useState<string | null>(null);

  const fallbackOptions = useMemo(() => {
    return allSteps.filter((s) => s.id !== step?.id);
  }, [allSteps, step?.id]);

  if (!step) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
          Select a step to configure agent assignment, retries, timeouts, and variable
          bindings.
        </CardContent>
      </Card>
    );
  }

  const isLinking = linkingFromStepId === step.id;

  const fieldIds = {
    name: `workflow-step-${step.id}-name`,
    timeout: `workflow-step-${step.id}-timeout`,
    retries: `workflow-step-${step.id}-retries`,
    agent: `workflow-step-${step.id}-agent`,
    fallback: `workflow-step-${step.id}-fallback`,
    bindings: `workflow-step-${step.id}-bindings`,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{step.name}</CardTitle>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {step.type}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onDeleteStep(step.id)}
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={fieldIds.name}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Step name
          </label>
          <input
            id={fieldIds.name}
            value={step.name}
            onChange={(e) => onUpdateStep(step.id, { name: e.target.value })}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label
              htmlFor={fieldIds.timeout}
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Timeout (seconds)
            </label>
            <input
              id={fieldIds.timeout}
              type="number"
              min={0}
              value={step.timeoutSeconds ?? 0}
              onChange={(e) =>
                onUpdateStep(step.id, {
                  timeoutSeconds: Number(e.target.value) || undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={fieldIds.retries}
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Retries
            </label>
            <input
              id={fieldIds.retries}
              type="number"
              min={0}
              value={step.retries ?? 0}
              onChange={(e) =>
                onUpdateStep(step.id, {
                  retries: Number(e.target.value) || undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={fieldIds.agent}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Agent assignment
          </label>
          {agentDefinitions && agentDefinitions.length > 0 ? (
            <select
              id={fieldIds.agent}
              value={step.agentId ?? ""}
              onChange={(e) =>
                onUpdateStep(step.id, {
                  agentId: e.target.value || undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">Unassigned</option>
              {agentDefinitions.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={fieldIds.agent}
              value={step.agentId ?? ""}
              placeholder="agent-id"
              onChange={(e) =>
                onUpdateStep(step.id, {
                  agentId: e.target.value || undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={fieldIds.fallback}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Fallback step
          </label>
          <select
            id={fieldIds.fallback}
            value={step.fallbackStepId ?? ""}
            onChange={(e) =>
              onUpdateStep(step.id, {
                fallbackStepId: e.target.value || undefined,
              })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">None</option>
            {fallbackOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={fieldIds.bindings}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Variable bindings (JSON)
          </label>
          <textarea
            id={fieldIds.bindings}
            value={bindingsDraft}
            onChange={(e) => {
              const next = e.target.value;
              setBindingsDraft(next);

              const parsed = parseRecord(next);
              if (parsed.error) {
                setBindingsError(parsed.error);
                return;
              }

              setBindingsError(null);
              onUpdateStep(step.id, { bindings: parsed.value ?? {} });
            }}
            rows={6}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {bindingsError ? (
            <p className="text-xs text-rose-600 dark:text-rose-300">
              {bindingsError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLinking ? (
            <Button size="sm" type="button" onClick={onCancelLinking}>
              Cancel linking
            </Button>
          ) : (
            <Button
              size="sm"
              type="button"
              onClick={() => onStartLinking(step.id)}
            >
              Link from this step
            </Button>
          )}
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {isLinking
              ? "Click another step on the canvas to create a dependency."
              : "Dependencies are drawn on the canvas."}
          </p>
        </div>

        {issues && issues.length > 0 ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
            <p className="text-xs font-semibold">Validation issues</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              {issues.map((issue, idx) => (
                <li key={`${issue.message}-${idx}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
