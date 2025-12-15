import React from "react";
import { render, screen } from "@testing-library/react";
import { AgentStatusList } from "@/components/mgx/agent-status-list";
import type { AgentInstance } from "@/lib/types";

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span className={className}>Loader2</span>
  ),
}));

jest.mock("@/components/mgx/agent-status-badge", () => ({
  AgentStatusBadge: ({ status }: { status: string }) => (
    <span>{status}</span>
  ),
}));

describe("AgentStatusList", () => {
  it("renders loading state", () => {
    render(<AgentStatusList isLoading={true} />);
    expect(screen.getByText("Loader2")).toBeInTheDocument();
  });

  it("renders empty state when no agents", () => {
    render(<AgentStatusList agents={[]} />);
    expect(screen.getByText("No agents assigned.")).toBeInTheDocument();
  });

  it("renders agent list with status", () => {
    const agents: AgentInstance[] = [
      {
        id: "agent-1",
        definitionId: "def-1",
        name: "Analysis Agent",
        status: "active",
      },
      {
        id: "agent-2",
        definitionId: "def-2",
        name: "Execution Agent",
        status: "idle",
      },
    ];

    render(<AgentStatusList agents={agents} />);
    expect(screen.getByText("Analysis Agent")).toBeInTheDocument();
    expect(screen.getByText("Execution Agent")).toBeInTheDocument();
  });

  it("renders agent metrics when available", () => {
    const agents: AgentInstance[] = [
      {
        id: "agent-1",
        definitionId: "def-1",
        name: "Agent One",
        status: "active",
        metrics: {
          messagesProcessed: 42,
        },
      },
    ];

    render(<AgentStatusList agents={agents} />);
    expect(screen.getByText("Agent One")).toBeInTheDocument();
    expect(screen.getByText("42 messages")).toBeInTheDocument();
  });

  it("applies compact styles when compact prop is true", () => {
    const agents: AgentInstance[] = [
      {
        id: "agent-1",
        definitionId: "def-1",
        name: "Agent",
        status: "active",
      },
    ];

    const { container } = render(<AgentStatusList agents={agents} compact={true} />);
    expect(container.querySelector(".space-y-1")).toBeInTheDocument();
  });

  it("applies normal styles when compact is false", () => {
    const agents: AgentInstance[] = [
      {
        id: "agent-1",
        definitionId: "def-1",
        name: "Agent",
        status: "active",
      },
    ];

    const { container } = render(<AgentStatusList agents={agents} compact={false} />);
    expect(container.querySelector(".space-y-2")).toBeInTheDocument();
  });
});
