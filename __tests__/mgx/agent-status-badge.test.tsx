import React from "react";
import { render, screen } from "@testing-library/react";
import { AgentStatusBadge } from "@/components/mgx/agent-status-badge";
import type { AgentStatus } from "@/lib/types";

jest.mock("lucide-react", () => ({
  Activity: ({ className }: { className?: string }) => (
    <span className={className}>Activity</span>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <span className={className}>AlertCircle</span>
  ),
}));

describe("AgentStatusBadge", () => {
  it("renders active status badge", () => {
    render(<AgentStatusBadge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders idle status badge", () => {
    render(<AgentStatusBadge status="idle" />);
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("renders executing status badge", () => {
    render(<AgentStatusBadge status="executing" />);
    expect(screen.getByText("executing")).toBeInTheDocument();
  });

  it("renders error status badge", () => {
    render(<AgentStatusBadge status="error" />);
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("renders offline status badge", () => {
    render(<AgentStatusBadge status="offline" />);
    expect(screen.getByText("offline")).toBeInTheDocument();
  });

  it("hides dot when showDot is false", () => {
    const { container } = render(<AgentStatusBadge status="active" showDot={false} />);
    const dot = container.querySelector(".w-1\\.5");
    expect(dot).not.toBeInTheDocument();
  });

  it("shows dot by default", () => {
    const { container } = render(<AgentStatusBadge status="active" />);
    const dot = container.querySelector(".w-1\\.5");
    expect(dot).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AgentStatusBadge status="active" className="custom-class" />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has correct color classes for different statuses", () => {
    const statuses: AgentStatus[] = ["idle", "active", "executing", "error", "offline"];

    statuses.forEach((status) => {
      const { container: elem } = render(<AgentStatusBadge status={status} />);
      const badge = elem.querySelector("span[class*='inline-flex']");
      expect(badge).toBeInTheDocument();
    });
  });
});
