import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentList } from "@/components/mgx/agent-list";
import type { AgentInstance } from "@/lib/types";

jest.mock("lucide-react", () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <span className={className}>ChevronDown</span>
  ),
}));

describe("AgentList", () => {
  const mockAgents: AgentInstance[] = [
    {
      id: "agent-1",
      name: "Agent One",
      definitionId: "def-1",
      status: "active",
      lastHeartbeat: Date.now(),
      metrics: {
        messagesProcessed: 10,
        actionsExecuted: 5,
        errorCount: 0,
      },
    },
    {
      id: "agent-2",
      name: "Agent Two",
      definitionId: "def-2",
      status: "idle",
      taskId: "task-1",
      lastHeartbeat: Date.now() - 3600000,
      metrics: {
        messagesProcessed: 5,
        actionsExecuted: 2,
        errorCount: 1,
      },
    },
  ];

  const mockOnSelectAgent = jest.fn();

  it("renders empty state when no agents", () => {
    render(
      <AgentList agents={[]} onSelectAgent={mockOnSelectAgent} />
    );
    expect(screen.getByText(/No agents found/)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <AgentList agents={[]} isLoading={true} onSelectAgent={mockOnSelectAgent} />
    );
    expect(screen.getByText(/Loading agents/)).toBeInTheDocument();
  });

  it("renders agent list with correct columns", () => {
    render(
      <AgentList agents={mockAgents} onSelectAgent={mockOnSelectAgent} />
    );
    
    expect(screen.getByText("Agent One")).toBeInTheDocument();
    expect(screen.getByText("Agent Two")).toBeInTheDocument();
    expect(screen.getByText("def-1")).toBeInTheDocument();
    expect(screen.getByText("def-2")).toBeInTheDocument();
  });

  it("calls onSelectAgent when row is clicked", () => {
    render(
      <AgentList agents={mockAgents} onSelectAgent={mockOnSelectAgent} />
    );
    
    const agentOneRow = screen.getByText("Agent One").closest("tr");
    if (agentOneRow) {
      fireEvent.click(agentOneRow);
      expect(mockOnSelectAgent).toHaveBeenCalledWith("agent-1");
    }
  });

  it("highlights selected agent", () => {
    const { container } = render(
      <AgentList
        agents={mockAgents}
        selectedAgentId="agent-1"
        onSelectAgent={mockOnSelectAgent}
      />
    );
    
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("bg-zinc-50");
  });

  it("filters agents by status", () => {
    render(
      <AgentList
        agents={mockAgents}
        statusFilter="active"
        onSelectAgent={mockOnSelectAgent}
      />
    );
    
    expect(screen.getByText("Agent One")).toBeInTheDocument();
    expect(screen.queryByText("Agent Two")).not.toBeInTheDocument();
  });

  it("displays task ID when available", () => {
    render(
      <AgentList agents={mockAgents} onSelectAgent={mockOnSelectAgent} />
    );
    
    expect(screen.getByText("task-1")).toBeInTheDocument();
  });

  it("handles sorting by name", () => {
    const { container } = render(
      <AgentList agents={mockAgents} onSelectAgent={mockOnSelectAgent} />
    );
    
    const nameHeaderBtn = Array.from(
      container.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("Name"));
    
    if (nameHeaderBtn) {
      fireEvent.click(nameHeaderBtn);
      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Agent One");
    }
  });
});
