import React from "react";
import { render, screen } from "@testing-library/react";
import { AgentMetricsSummary } from "@/components/mgx/agent-metrics-summary";

jest.mock("lucide-react", () => ({
  Activity: ({ className }: { className?: string }) => (
    <span className={className}>Activity</span>
  ),
  Zap: ({ className }: { className?: string }) => (
    <span className={className}>Zap</span>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <span className={className}>AlertCircle</span>
  ),
  BarChart3: ({ className }: { className?: string }) => (
    <span className={className}>BarChart3</span>
  ),
}));

jest.mock("@/components/mgx/ui/card", () => ({
  Card: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: Record<string, unknown>) => (
    <p data-testid="card-title" {...props}>
      {children}
    </p>
  ),
  CardDescription: ({ children, ...props }: Record<string, unknown>) => (
    <p data-testid="card-description" {...props}>
      {children}
    </p>
  ),
  CardContent: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}));

describe("AgentMetricsSummary", () => {
  it("renders compact view", () => {
    const { container } = render(
      <AgentMetricsSummary
        activCount={5}
        idleCount={3}
        errorCount={1}
        totalCount={9}
        compact={true}
      />
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Idle")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(container.querySelector(".grid-cols-4")).toBeInTheDocument();
  });

  it("renders full card view by default", () => {
    render(
      <AgentMetricsSummary
        activCount={5}
        idleCount={3}
        errorCount={1}
        totalCount={9}
      />
    );

    expect(screen.getByText("Active Agents")).toBeInTheDocument();
    expect(screen.getByText("Idle Agents")).toBeInTheDocument();
    expect(screen.getByText("Error Agents")).toBeInTheDocument();
    expect(screen.getByText("Total Agents")).toBeInTheDocument();
  });

  it("displays correct counts", () => {
    render(
      <AgentMetricsSummary
        activCount={5}
        idleCount={3}
        errorCount={1}
        totalCount={9}
        compact={true}
      />
    );

    expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    expect(screen.getAllByText("3")[0]).toBeInTheDocument();
    expect(screen.getAllByText("1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("9")[0]).toBeInTheDocument();
  });

  it("renders card descriptions in full view", () => {
    render(
      <AgentMetricsSummary
        activCount={5}
        idleCount={3}
        errorCount={1}
        totalCount={9}
        compact={false}
      />
    );

    expect(screen.getByText("Currently executing")).toBeInTheDocument();
    expect(screen.getByText("Waiting for tasks")).toBeInTheDocument();
    expect(screen.getByText("Require attention")).toBeInTheDocument();
    expect(screen.getByText("All available")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AgentMetricsSummary
        activCount={0}
        idleCount={0}
        errorCount={0}
        totalCount={0}
        className="custom-class"
      />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("handles zero counts", () => {
    render(
      <AgentMetricsSummary
        activCount={0}
        idleCount={0}
        errorCount={0}
        totalCount={0}
        compact={true}
      />
    );

    // Should render without errors and show zeros
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });
});
