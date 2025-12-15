import React from "react";
import { render, screen } from "@testing-library/react";
import { AgentActivityTimeline } from "@/components/mgx/agent-activity-timeline";
import type { AgentActivityEvent } from "@/lib/types";

jest.mock("lucide-react", () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <span className={className}>CheckCircle</span>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <span className={className}>AlertCircle</span>
  ),
  Activity: ({ className }: { className?: string }) => (
    <span className={className}>Activity</span>
  ),
  Loader2: ({ className }: { className?: string }) => (
    <span className={className}>Loader2</span>
  ),
}));

describe("AgentActivityTimeline", () => {
  it("renders loading state", () => {
    render(<AgentActivityTimeline isLoading={true} />);
    expect(screen.getByText("Loader2")).toBeInTheDocument();
  });

  it("renders empty state when no events", () => {
    render(<AgentActivityTimeline events={[]} />);
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  it("renders activity events", () => {
    const events: AgentActivityEvent[] = [
      {
        id: "event-1",
        agentId: "agent-1",
        agentName: "Analysis Agent",
        type: "action_completed",
        description: "Completed analysis task",
        timestamp: Date.now(),
      },
      {
        id: "event-2",
        agentId: "agent-2",
        agentName: "Execution Agent",
        type: "action_started",
        description: "Started execution",
        timestamp: Date.now(),
      },
    ];

    render(<AgentActivityTimeline events={events} />);
    expect(screen.getByText("Analysis Agent")).toBeInTheDocument();
    expect(screen.getByText("Completed analysis task")).toBeInTheDocument();
    expect(screen.getByText("Execution Agent")).toBeInTheDocument();
    expect(screen.getByText("Started execution")).toBeInTheDocument();
  });

  it("respects maxItems prop", () => {
    const events: AgentActivityEvent[] = Array.from({ length: 15 }, (_, i) => ({
      id: `event-${i}`,
      agentId: `agent-${i}`,
      agentName: `Agent ${i}`,
      type: "message" as const,
      description: `Event ${i}`,
      timestamp: Date.now(),
    }));

    render(<AgentActivityTimeline events={events} maxItems={5} />);
    const descriptions = screen.getAllByText(/Event \d/);
    expect(descriptions.length).toBeLessThanOrEqual(5);
  });

  it("renders error events with proper styling", () => {
    const events: AgentActivityEvent[] = [
      {
        id: "event-1",
        agentId: "agent-1",
        agentName: "Failed Agent",
        type: "error",
        description: "Agent encountered an error",
        timestamp: Date.now(),
      },
    ];

    render(<AgentActivityTimeline events={events} />);
    expect(screen.getByText("Failed Agent")).toBeInTheDocument();
    expect(screen.getByText("Agent encountered an error")).toBeInTheDocument();
  });

  it("displays timestamps", () => {
    const now = Date.now();
    const events: AgentActivityEvent[] = [
      {
        id: "event-1",
        agentId: "agent-1",
        agentName: "Agent",
        type: "message",
        description: "Test event",
        timestamp: now,
      },
    ];

    const { container } = render(<AgentActivityTimeline events={events} />);
    const timestamp = container.querySelector("span[class*='whitespace-nowrap']");
    expect(timestamp).toBeInTheDocument();
  });
});
