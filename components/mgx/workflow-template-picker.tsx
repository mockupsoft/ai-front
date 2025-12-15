"use client";

import type { WorkflowTemplate } from "@/lib/types/workflows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import { Spinner } from "@/components/mgx/ui/spinner";

export interface WorkflowTemplatePickerProps {
  templates?: WorkflowTemplate[];
  isLoading?: boolean;
  onApplyTemplate: (template: WorkflowTemplate) => void;
  onStartBlank: () => void;
}

export function WorkflowTemplatePicker({
  templates,
  isLoading,
  onApplyTemplate,
  onStartBlank,
}: WorkflowTemplatePickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Start with a template workflow or a blank canvas.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="button" onClick={onStartBlank}>
            Blank workflow
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Spinner className="h-4 w-4" />
            Loading templates…
          </div>
        ) : null}

        {templates && templates.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template)}
                className="rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {template.name}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {template.description || "—"}
                </p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {template.definition.steps.length} step
                  {template.definition.steps.length === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No templates available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
