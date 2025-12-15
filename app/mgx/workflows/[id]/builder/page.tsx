"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { WorkflowBuilder } from "@/components/mgx/workflow-builder";
import { Spinner } from "@/components/mgx/ui/spinner";
import { useWorkflow } from "@/hooks/useWorkflows";

export default function WorkflowBuilderPage() {
  const params = useParams<{ id?: string | string[] }>();
  const workflowId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { workflow, isLoading, isError, error, mutate } = useWorkflow(workflowId);

  if (!workflowId) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Workflow builder</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Missing workflow id.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-6 w-6" />
        <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
          Loading workflow…
        </span>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Workflow builder</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Failed to load workflow.
          </p>
        </div>
        <p className="text-sm text-rose-700 dark:text-rose-300">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Link
          href="/mgx/workflows"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Back to workflows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/mgx/workflows"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to workflows
      </Link>

      <WorkflowBuilder
        workflowId={workflowId}
        initialWorkflow={workflow}
        onSaved={async () => {
          await mutate();
        }}
      />
    </div>
  );
}
