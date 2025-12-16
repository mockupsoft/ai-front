import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentDetailsPanel } from "@/components/mgx/agent-details-panel";
import type { AgentInstance } from "@/lib/types";

jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      context: { test: "value" },
      timestamp: Date.now(),
    },
    error: null,
    isLoading: false,
  })),
}));

jest.mock("lucide-react", () => ({
  ChevronRight: ({ className }: { className?: string }) => (
    <span className={className}>ChevronRight</span>
  ),
}));

jest.mock("@/lib/api", () => ({
  fetchAgentContext: jest.fn(),
  fetchAgentContextHistory: jest.fn(),
}));

describe("AgentDetailsPanel", () => {
  const mockAgent: AgentInstance = {
    id: "agent-1",
    name: "Test Agent",
    definitionId: "def-1",
    status: "active",
    context: { key: "value" },
    metrics: {
      messagesProcessed: 100,
      actionsExecuted: 50,
      errorCount: 2,
      averageResponseTimeMs: 150,
    },
  };

  const mockOnEdit = jest.fn();
  const mockOnRollback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders agent details", () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText("Test Agent")).toBeInTheDocument();
    expect(screen.getByText("def-1")).toBeInTheDocument();
  });

  it("displays agent metrics", () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText("100")).toBeInTheDocument(); // messagesProcessed
    expect(screen.getByText("50")).toBeInTheDocument(); // actionsExecuted
    expect(screen.getByText("2")).toBeInTheDocument(); // errorCount
    expect(screen.getByText("150ms")).toBeInTheDocument(); // averageResponseTimeMs
  });

  it("allows editing configuration", async () => {
    mockOnEdit.mockResolvedValue(undefined);

    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    const editButton = screen.getByRole("button", { name: /Edit/ });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: /Save/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalled();
    });
  });

  it("toggles context history visibility", async () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    const showHistoryButton = screen.getByRole("button", { name: /Show History/ });
    fireEvent.click(showHistoryButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Hide History/ })).toBeInTheDocument();
    });
  });

  it("displays agent ID", () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText(mockAgent.id)).toBeInTheDocument();
  });

  it("displays linked task if available", () => {
    const agentWithTask: AgentInstance = {
      ...mockAgent,
      taskId: "task-123",
    };

    render(
      <AgentDetailsPanel
        agent={agentWithTask}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText("task-123")).toBeInTheDocument();
  });

  it("handles cancel button when editing config", async () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    const editButton = screen.getByRole("button", { name: /Edit/ });
    fireEvent.click(editButton);

    const cancelButton = await screen.findByRole("button", { name: /Cancel/ });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Save/ })).not.toBeInTheDocument();
    });
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("renders configuration section", () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText(/Configuration/)).toBeInTheDocument();
  });

  it("renders context history section", () => {
    render(
      <AgentDetailsPanel
        agent={mockAgent}
        onEdit={mockOnEdit}
        onRollback={mockOnRollback}
      />
    );

    expect(screen.getByText(/Context History/)).toBeInTheDocument();
  });
});
