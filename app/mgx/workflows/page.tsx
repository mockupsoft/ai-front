"use client";

import { useRouter } from "next/navigation";

import { WorkflowList } from "@/components/mgx/workflow-list";
import { Button } from "@/components/mgx/ui/button";
import { useWorkflows } from "@/hooks/useWorkflows";

export default function WorkflowsPage() {
  const router = useRouter();
  const { workflows, isLoading } = useWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Workflows</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage workflow definitions and open the visual builder.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => router.push("/mgx/workflows/new")}
        >
          New workflow
        </Button>
      </div>

      <WorkflowList workflows={workflows} isLoading={isLoading} />
    </div>
  );
}
