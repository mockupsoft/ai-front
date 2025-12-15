"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { WorkflowBuilder } from "@/components/mgx/workflow-builder";
import { WorkflowTemplatePicker } from "@/components/mgx/workflow-template-picker";
import { useWorkflowTemplates } from "@/hooks/useWorkflows";
import type { WorkflowDefinition, WorkflowTemplate } from "@/lib/types/workflows";

function blankDefinition(): WorkflowDefinition {
  return { schemaVersion: 1, steps: [], edges: [], variables: [] };
}

export default function NewWorkflowPage() {
  const router = useRouter();
  const { templates, isLoading } = useWorkflowTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(
    null,
  );
  const [started, setStarted] = useState(false);

  const builderKey = useMemo(() => {
    if (!started) return "picker";
    return selectedTemplate ? `template-${selectedTemplate.id}` : "blank";
  }, [started, selectedTemplate]);

  const initial = useMemo(() => {
    if (!started) return null;
    if (selectedTemplate) {
      return {
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        definition: selectedTemplate.definition,
      };
    }
    return {
      name: "",
      description: "",
      definition: blankDefinition(),
    };
  }, [started, selectedTemplate]);

  return (
    <div className="space-y-6">
      {!started ? (
        <WorkflowTemplatePicker
          templates={templates}
          isLoading={isLoading}
          onApplyTemplate={(template) => {
            setSelectedTemplate(template);
            setStarted(true);
          }}
          onStartBlank={() => {
            setSelectedTemplate(null);
            setStarted(true);
          }}
        />
      ) : null}

      {initial ? (
        <WorkflowBuilder
          key={builderKey}
          initialDefinition={initial.definition}
          initialName={initial.name}
          initialDescription={initial.description}
          onSaved={(workflow) => {
            router.push(`/mgx/workflows/${workflow.id}/builder`);
          }}
        />
      ) : null}
    </div>
  );
}
