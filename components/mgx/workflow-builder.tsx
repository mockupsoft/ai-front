"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import {
  createWorkflow,
  fetchAgentDefinitions,
  updateWorkflow,
  validateWorkflowDefinition,
  type ApiRequestOptions,
} from "@/lib/api";
import type { AgentDefinition } from "@/lib/types";
import type {
  Workflow,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepPosition,
  WorkflowStepType,
  WorkflowUpsertRequest,
  WorkflowValidationResult,
  WorkflowVariable,
} from "@/lib/types/workflows";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { WorkflowCanvas, type WorkflowCanvasView } from "@/components/mgx/workflow-canvas";
import { WorkflowStepPalette } from "@/components/mgx/workflow-step-palette";
import { WorkflowStepPanel } from "@/components/mgx/workflow-step-panel";

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

function blankDefinition(): WorkflowDefinition {
  return {
    schemaVersion: 1,
    steps: [],
    edges: [],
    variables: [],
  };
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

function parseVariables(value: string): { value?: WorkflowVariable[]; error?: string } {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: "Variables must be a JSON array." };
    }

    const variables: WorkflowVariable[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        return { error: "Each variable must be an object." };
      }
      const variable = item as Partial<WorkflowVariable>;
      if (!variable.name || typeof variable.name !== "string") {
        return { error: "Each variable must include a string name." };
      }
      variables.push({
        name: variable.name,
        type: variable.type,
        description: variable.description,
        defaultValue: variable.defaultValue,
      });
    }

    return { value: variables };
  } catch {
    return { error: "Invalid JSON." };
  }
}

function defaultStepName(type: WorkflowStepType) {
  switch (type) {
    case "agent_task":
      return "Agent task";
    case "script":
      return "Script";
    case "condition":
      return "Condition";
    case "http_request":
      return "HTTP request";
    case "delay":
      return "Delay";
    default:
      return "Step";
  }
}

export interface WorkflowBuilderProps {
  workflowId?: string;
  initialWorkflow?: Workflow;
  initialDefinition?: WorkflowDefinition;
  initialName?: string;
  initialDescription?: string;
  onSaved?: (workflow: Workflow) => void;
}

export function WorkflowBuilder({
  workflowId,
  initialWorkflow,
  initialDefinition,
  initialName,
  initialDescription,
  onSaved,
}: WorkflowBuilderProps) {
  const { currentWorkspace, currentProject } = useWorkspace();

  const apiOptions: ApiRequestOptions = useMemo(
    () => ({
      workspaceId: currentWorkspace?.id,
      projectId: currentProject?.id,
    }),
    [currentWorkspace?.id, currentProject?.id],
  );

  const { data: agentDefinitions } = useSWR<AgentDefinition[]>(
    currentWorkspace ? ["/agents/definitions", apiOptions] : null,
    ([, opts]) => fetchAgentDefinitions(opts as ApiRequestOptions),
  );

  const [name, setName] = useState(initialName ?? initialWorkflow?.name ?? "");
  const [description, setDescription] = useState(
    initialDescription ?? initialWorkflow?.description ?? "",
  );

  const [definition, setDefinition] = useState<WorkflowDefinition>(
    initialWorkflow?.definition ?? initialDefinition ?? blankDefinition(),
  );

  const [view, setView] = useState<WorkflowCanvasView>({ x: 40, y: 40, zoom: 1 });
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(
    definition.steps[0]?.id,
  );
  const [linkingFromStepId, setLinkingFromStepId] = useState<string | null>(null);

  const [validation, setValidation] = useState<WorkflowValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [variablesDraft, setVariablesDraft] = useState<string>(
    stringifyJson(definition.variables ?? []),
  );
  const [variablesError, setVariablesError] = useState<string | null>(null);

  useEffect(() => {
    setVariablesDraft(stringifyJson(definition.variables ?? []));
    setVariablesError(null);
  }, [definition.variables]);

  const selectedStep = useMemo(
    () => definition.steps.find((step) => step.id === selectedStepId),
    [definition.steps, selectedStepId],
  );

  const issuesByStepId = useMemo(() => {
    const issues: Record<string, number> = {};
    for (const issue of validation?.issues ?? []) {
      if (issue.stepId) {
        issues[issue.stepId] = (issues[issue.stepId] ?? 0) + 1;
      }
    }
    return issues;
  }, [validation?.issues]);

  const selectedIssues = useMemo(() => {
    if (!selectedStepId) return undefined;
    return (validation?.issues ?? []).filter((issue) => issue.stepId === selectedStepId);
  }, [validation?.issues, selectedStepId]);

  const addStep = useCallback(
    (type: WorkflowStepType, position?: WorkflowStepPosition) => {
      const step: WorkflowStep = {
        id: createId("step"),
        type,
        name: defaultStepName(type),
        position: position ?? {
          x: 180 + definition.steps.length * 40,
          y: 140 + definition.steps.length * 40,
        },
        bindings: {},
      };

      setDefinition((prev) => ({
        ...prev,
        steps: [...prev.steps, step],
      }));
      setSelectedStepId(step.id);
      setValidation(null);
    },
    [definition.steps.length],
  );

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setDefinition((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step,
      ),
    }));
    setValidation(null);
  }, []);

  const moveStep = useCallback((stepId: string, position: WorkflowStepPosition) => {
    setDefinition((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, position } : step,
      ),
    }));
  }, []);

  const deleteStep = useCallback(
    (stepId: string) => {
      setDefinition((prev) => ({
        ...prev,
        steps: prev.steps.filter((step) => step.id !== stepId),
        edges: prev.edges.filter(
          (edge) => edge.fromStepId !== stepId && edge.toStepId !== stepId,
        ),
      }));
      setSelectedStepId((prevSelected) => {
        if (prevSelected === stepId) return undefined;
        return prevSelected;
      });
      setLinkingFromStepId((prevLink) => (prevLink === stepId ? null : prevLink));
      setValidation(null);
    },
    [],
  );

  const createEdge = useCallback((fromStepId: string, toStepId: string) => {
    if (fromStepId === toStepId) return;

    setDefinition((prev) => {
      const exists = prev.edges.some(
        (edge) => edge.fromStepId === fromStepId && edge.toStepId === toStepId,
      );
      if (exists) return prev;

      return {
        ...prev,
        edges: [
          ...prev.edges,
          {
            id: createId("edge"),
            fromStepId,
            toStepId,
            kind: "dependency",
          },
        ],
      };
    });

    setLinkingFromStepId(null);
    setValidation(null);
  }, []);

  const applyVariablesDraft = useCallback(
    (nextDraft: string) => {
      setVariablesDraft(nextDraft);
      const parsed = parseVariables(nextDraft);
      if (parsed.error) {
        setVariablesError(parsed.error);
        return;
      }
      setVariablesError(null);
      setDefinition((prev) => ({ ...prev, variables: parsed.value ?? [] }));
    },
    [],
  );

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateWorkflowDefinition(definition, apiOptions);
      setValidation(result);

      if (result.valid) {
        toast.success("Workflow validated successfully");
      } else {
        toast.error("Workflow has validation issues");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to validate workflow");
    } finally {
      setIsValidating(false);
    }
  }, [definition, apiOptions]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    const payload: WorkflowUpsertRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      definition,
    };

    setIsSaving(true);
    try {
      const saved = workflowId
        ? await updateWorkflow(workflowId, payload, apiOptions)
        : await createWorkflow(payload, apiOptions);

      toast.success("Workflow saved");
      onSaved?.(saved);
      setValidation(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  }, [name, description, definition, workflowId, apiOptions, onSaved]);

  const validationStatus = validation
    ? validation.valid
      ? "valid"
      : "invalid"
    : "unknown";

  const validationIssueSummary = useMemo(() => {
    const issues = validation?.issues ?? [];
    const errors = issues.filter((issue) => issue.severity === "error").length;
    const warnings = issues.filter((issue) => issue.severity === "warning").length;
    return { errors, warnings };
  }, [validation?.issues]);

  const workflowIssues = useMemo(() => {
    return (validation?.issues ?? []).filter((issue) => !issue.stepId);
  }, [validation?.issues]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Workflow builder</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Compose workflows visually, validate definitions, and persist changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {validationStatus === "valid" ? (
            <StatusPill variant="success">Valid</StatusPill>
          ) : validationStatus === "invalid" ? (
            <StatusPill variant="danger">
              {validationIssueSummary.errors} errors
              {validationIssueSummary.warnings ? ` • ${validationIssueSummary.warnings} warnings` : ""}
            </StatusPill>
          ) : (
            <StatusPill variant="info">Not validated</StatusPill>
          )}

          <Button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            variant="secondary"
          >
            {isValidating ? "Validating…" : "Validate"}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            variant="primary"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="workflow-name"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow name"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="workflow-description"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>
            <input
              id="workflow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_380px]">
        <div className="space-y-6">
          <WorkflowStepPalette onAddStep={(type) => addStep(type)} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <textarea
                value={variablesDraft}
                onChange={(e) => applyVariablesDraft(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {variablesError ? (
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  {variablesError}
                </p>
              ) : (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Define workflow-level variables (inputs/params) as JSON.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <WorkflowCanvas
            steps={definition.steps}
            edges={definition.edges}
            selectedStepId={selectedStepId}
            linkingFromStepId={linkingFromStepId}
            issuesByStepId={issuesByStepId}
            view={view}
            onChangeView={setView}
            onSelectStep={setSelectedStepId}
            onMoveStep={moveStep}
            onDropNewStep={(type, position) => addStep(type, position)}
            onCreateEdge={createEdge}
          />

          {workflowIssues.length > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
              <p className="text-xs font-semibold">Workflow validation issues</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                {workflowIssues.map((issue, idx) => (
                  <li key={`${issue.message}-${idx}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <WorkflowStepPanel
            key={selectedStep?.id ?? "workflow-step-panel"}
            step={selectedStep}
            allSteps={definition.steps}
            agentDefinitions={agentDefinitions}
            issues={selectedIssues}
            linkingFromStepId={linkingFromStepId}
            onStartLinking={(id) => setLinkingFromStepId(id)}
            onCancelLinking={() => setLinkingFromStepId(null)}
            onUpdateStep={updateStep}
            onDeleteStep={deleteStep}
          />

          {validation && validation.issues.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Validation output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Latest resolver output. Click a step to see its issues.
                </p>

                <ul className="space-y-2">
                  {validation.issues.slice(0, 8).map((issue, idx) => (
                    <li
                      key={`${issue.message}-${idx}`}
                      className="rounded-md border border-zinc-200 bg-white p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      <p className="font-semibold">
                        {issue.severity.toUpperCase()}
                        {issue.stepId ? ` • ${issue.stepId}` : ""}
                      </p>
                      <p className="mt-1">{issue.message}</p>
                    </li>
                  ))}
                </ul>

                {validation.issues.length > 8 ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Showing 8 of {validation.issues.length} issues.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
