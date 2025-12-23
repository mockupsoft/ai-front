import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { WorkflowBuilder } from "@/components/mgx/workflow-builder";
import type {
  WorkflowDefinition,
  WorkflowUpsertRequest,
  WorkflowValidationResult,
} from "@/lib/types/workflows";

import * as api from "@/lib/api";
import * as workspaceContext from "@/lib/mgx/workspace/workspace-context";
import useSWR from "swr";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/api");
jest.mock("@/lib/mgx/workspace/workspace-context");
jest.mock("swr");

describe("WorkflowBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    (api.fetchAgentDefinitions as jest.Mock).mockResolvedValue([]);
  });

  const blank: WorkflowDefinition = {
    schemaVersion: 1,
    steps: [],
    edges: [],
    variables: [],
  };

  it("adds a step from the palette", async () => {
    render(<WorkflowBuilder initialDefinition={blank} initialName="Demo" />);

    const palette = screen.getByLabelText("Step palette");
    const scriptCard = within(palette).getByText("Script").closest("div");
    expect(scriptCard).toBeTruthy();

    fireEvent.click(within(scriptCard as HTMLElement).getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Step Script")).toBeInTheDocument();
    });
  });

  it("surfaces validation issues inline", async () => {
    const definition: WorkflowDefinition = {
      schemaVersion: 1,
      steps: [
        {
          id: "step-1",
          type: "agent_task",
          name: "Agent task",
          position: { x: 100, y: 100 },
          bindings: {},
        },
      ],
      edges: [],
      variables: [],
    };

    const validationResult: WorkflowValidationResult = {
      valid: false,
      issues: [
        {
          message: "Agent assignment required",
          severity: "error",
          stepId: "step-1",
        },
      ],
    };

    (api.validateWorkflowDefinition as jest.Mock).mockResolvedValue(validationResult);

    render(<WorkflowBuilder initialDefinition={definition} initialName="Demo" />);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    await waitFor(() => {
      expect(api.validateWorkflowDefinition).toHaveBeenCalled();
    });

    const node = screen.getByLabelText("Step Agent task");
    expect(within(node).getByText("1")).toBeInTheDocument();

    fireEvent.click(node);

    // Wait for validation issues to appear in the step panel
    await waitFor(() => {
      // Use getAllByText and check that at least one exists, since the message might appear multiple times
      const messages = screen.getAllByText("Agent assignment required");
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  it("creates a workflow on save when workflowId is not provided", async () => {
    const definition: WorkflowDefinition = {
      schemaVersion: 1,
      steps: [],
      edges: [],
      variables: [],
    };

    (api.createWorkflow as jest.Mock).mockImplementation(
      async (payload: WorkflowUpsertRequest) => ({
        id: "workflow-1",
        name: payload.name,
        description: payload.description,
        definition: payload.definition,
      }),
    );

    render(<WorkflowBuilder initialDefinition={definition} initialName="Demo" />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(api.createWorkflow).toHaveBeenCalledTimes(1);
    });

    expect((api.createWorkflow as jest.Mock).mock.calls[0][0]).toEqual({
      name: "Demo",
      description: undefined,
      definition,
    });
  });
});
