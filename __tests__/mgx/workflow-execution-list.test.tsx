import React from "react";
import { render, screen } from "@testing-library/react";
import { WorkflowExecutionList } from "@/components/mgx/workflow-execution-list";
import type { WorkflowExecution } from "@/lib/types/workflows";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  );
});

describe("WorkflowExecutionList", () => {
  const mockExecutions: WorkflowExecution[] = [
    {
      id: "exec-1",
      workflowId: "wf-1",
      status: "completed",
      startedAt: Date.now() - 120000,
      completedAt: Date.now() - 60000,
      durationMs: 60000,
      steps: [
        {
          stepId: "step-1",
          stepName: "Step 1",
          status: "completed",
          durationMs: 30000,
        },
        {
          stepId: "step-2",
          stepName: "Step 2",
          status: "completed",
          durationMs: 30000,
        },
      ],
    },
    {
      id: "exec-2",
      workflowId: "wf-1",
      status: "failed",
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
      durationMs: 60000,
      steps: [
        {
          stepId: "step-1",
          stepName: "Step 1",
          status: "completed",
          durationMs: 30000,
        },
        {
          stepId: "step-2",
          stepName: "Step 2",
          status: "failed",
          durationMs: 30000,
          error: "Step timeout",
        },
      ],
    },
  ];

  it("renders loading state", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        isLoading={true}
      />
    );
    expect(screen.getByText("Loading executions…")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={[]}
      />
    );
    expect(screen.getByText("No executions found.")).toBeInTheDocument();
  });

  it("renders execution list with rows", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    expect(screen.getByText("exec-1")).toBeInTheDocument();
    expect(screen.getByText("exec-2")).toBeInTheDocument();
  });

  it("displays execution status", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("displays step completion ratio", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("displays execution duration", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    expect(screen.getAllByText("1m 0s").length).toBeGreaterThan(0);
  });

  it("displays relative time", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    const timeElements = screen.queryAllByText(/\d+m ago|just now/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("links to execution detail page", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    const link = screen.getByText("exec-1").closest("a");
    expect(link).toHaveAttribute(
      "href",
      "/mgx/workflows/wf-1/executions/exec-1"
    );
  });

  it("renders table headers", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={mockExecutions}
      />
    );
    expect(screen.getByText("Execution ID")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Started")).toBeInTheDocument();
  });

  it("handles null executions gracefully", () => {
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={undefined}
      />
    );
    expect(screen.getByText("No executions found.")).toBeInTheDocument();
  });

  it("formats different durations correctly", () => {
    const executionsWithDifferentDurations: WorkflowExecution[] = [
      {
        ...mockExecutions[0],
        id: "exec-fast",
        durationMs: 500,
        steps: [],
      },
      {
        ...mockExecutions[0],
        id: "exec-medium",
        durationMs: 35000,
        steps: [],
      },
      {
        ...mockExecutions[0],
        id: "exec-slow",
        durationMs: 125000,
        steps: [],
      },
    ];
    render(
      <WorkflowExecutionList
        workflowId="wf-1"
        executions={executionsWithDifferentDurations}
      />
    );
    expect(screen.getByText("500ms")).toBeInTheDocument();
    expect(screen.getByText("35s")).toBeInTheDocument();
    expect(screen.getByText("2m 5s")).toBeInTheDocument();
  });
});
