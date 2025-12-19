"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { useWorkflowExecutions } from "@/hooks/useWorkflowExecutions";
import { Button } from "@/components/mgx/ui/button";
import { WorkflowExecutionList } from "@/components/mgx/workflow-execution-list";
import { triggerWorkflowExecution, type ApiRequestOptions } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { toast } from "sonner";

export default function WorkflowExecutionsPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const router = useRouter();
  const { workflowId } = use(params);
  const { currentWorkspace, currentProject } = useWorkspace();
  const { executions, isLoading, mutate } = useWorkflowExecutions(
    workflowId
  );

  const handleTriggerExecution = async () => {
    if (!currentWorkspace || !currentProject) {
      toast.error("Workspace or project not found");
      return;
    }

    try {
      const apiOptions: ApiRequestOptions = {
        workspaceId: currentWorkspace.id,
        projectId: currentProject.id,
      };

      const execution = await triggerWorkflowExecution(
        workflowId,
        {},
        apiOptions
      );

      toast.success(`Execution ${execution.id.slice(0, 8)} triggered`);
      mutate();

      // Navigate to the new execution
      router.push(
        `/mgx/workflows/${workflowId}/executions/${execution.id}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to trigger execution";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Workflow Executions</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            View execution history and real-time status updates.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={handleTriggerExecution}
        >
          Trigger Execution
        </Button>
      </div>

      <WorkflowExecutionList
        workflowId={workflowId}
        executions={executions}
        isLoading={isLoading}
      />
    </div>
  );
}
