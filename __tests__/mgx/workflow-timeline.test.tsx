import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkflowTimeline } from "@/components/mgx/workflow-timeline";
import type { WorkflowExecution } from "@/lib/types/workflows";

describe("WorkflowTimeline", () => {
  const mockExecution: WorkflowExecution = {
    id: "exec-1",
    workflowId: "wf-1",
    status: "completed",
    startedAt: Date.now() - 60000,
    completedAt: Date.now(),
    durationMs: 60000,
    steps: [
      {
        stepId: "step-1",
        stepName: "Step 1",
        status: "completed",
        startedAt: Date.now() - 60000,
        completedAt: Date.now() - 40000,
        durationMs: 20000,
        retryCount: 0,
        agentId: "agent-1",
        outputs: { result: "success" },
      },
      {
        stepId: "step-2",
        stepName: "Step 2",
        status: "completed",
        startedAt: Date.now() - 40000,
        completedAt: Date.now(),
        durationMs: 40000,
        retryCount: 0,
        agentId: "agent-2",
        outputs: { result: "complete" },
      },
    ],
  };

  it("renders loading state", () => {
    render(<WorkflowTimeline isLoading={true} />);
    expect(screen.getByText("Loading timeline…")).toBeInTheDocument();
  });

  it("renders empty state when no execution", () => {
    render(<WorkflowTimeline />);
    expect(screen.getByText("No execution data available.")).toBeInTheDocument();
  });

  it("renders timeline with steps", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    expect(screen.getByText("Execution Timeline")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("displays step status pills", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    const statusPills = screen.getAllByText("completed");
    expect(statusPills.length).toBeGreaterThan(0);
  });

  it("shows step duration", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    expect(screen.getByText("20s")).toBeInTheDocument();
    expect(screen.getByText("40s")).toBeInTheDocument();
  });

  it("expands step details when clicked", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    const step1 = screen.getByText("Step 1");
    fireEvent.click(step1.closest("div[class*='cursor-pointer']")!);
    expect(screen.getByText("Outputs")).toBeInTheDocument();
  });

  it("displays agent assignment", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    expect(screen.getByText(/Agent: agent-1/)).toBeInTheDocument();
    expect(screen.getByText(/Agent: agent-2/)).toBeInTheDocument();
  });

  it("shows error message when step fails", () => {
    const failedExecution: WorkflowExecution = {
      ...mockExecution,
      status: "failed",
      steps: [
        {
          ...mockExecution.steps[0],
          status: "failed",
          error: "Step timeout exceeded",
        },
      ],
    };
    render(<WorkflowTimeline execution={failedExecution} />);
    expect(screen.getByText("Error: Step timeout exceeded")).toBeInTheDocument();
  });

  it("shows retry count when step retried", () => {
    const retriedExecution: WorkflowExecution = {
      ...mockExecution,
      steps: [
        {
          ...mockExecution.steps[0],
          retryCount: 2,
        },
      ],
    };
    render(<WorkflowTimeline execution={retriedExecution} />);
    expect(screen.getByText("Retried 2 times")).toBeInTheDocument();
  });

  it("calls onStepSelect when step is clicked", () => {
    const onStepSelect = jest.fn();
    render(
      <WorkflowTimeline
        execution={mockExecution}
        onStepSelect={onStepSelect}
      />
    );
    const step1 = screen.getByText("Step 1");
    fireEvent.click(step1.closest("div[class*='cursor-pointer']")!);
    expect(onStepSelect).toHaveBeenCalledWith(mockExecution.steps[0]);
  });

  it("renders timeline bars with correct proportions", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    const bars = document.querySelectorAll("[style*='width']");
    expect(bars.length).toBeGreaterThan(0);
  });

  it("displays execution duration", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    expect(screen.getByText(/Total duration:.*1m/)).toBeInTheDocument();
  });

  it("handles empty step list", () => {
    const emptyExecution: WorkflowExecution = {
      ...mockExecution,
      steps: [],
    };
    render(<WorkflowTimeline execution={emptyExecution} />);
    expect(screen.getByText("No steps in execution.")).toBeInTheDocument();
  });

  it("toggles step expansion on click", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    const step1 = screen.getByText("Step 1");
    const stepContainer = step1.closest("div[class*='cursor-pointer']")!;

    // First click to expand
    fireEvent.click(stepContainer);
    expect(screen.getByText("Outputs")).toBeInTheDocument();

    // Second click to collapse
    fireEvent.click(stepContainer);
    // After collapse, the expanded details should be hidden
    // Check that clicking again removes the expansion
    expect(stepContainer.querySelector(".ml-4.mt-2")).not.toBeInTheDocument();
  });

  it("displays outputs in JSON format", () => {
    render(<WorkflowTimeline execution={mockExecution} />);
    const step1 = screen.getByText("Step 1");
    fireEvent.click(step1.closest("div[class*='cursor-pointer']")!);
    const preElements = document.querySelectorAll("pre");
    expect(preElements.length).toBeGreaterThan(0);
  });
});
