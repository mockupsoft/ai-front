import React from "react";
import { render, screen } from "@testing-library/react";
import { ExecutionMetricsCards } from "@/components/mgx/execution-metrics-cards";
import type { ExecutionMetrics } from "@/lib/types/workflows";

describe("ExecutionMetricsCards", () => {
  const mockMetrics: ExecutionMetrics = {
    totalDuration: 60000,
    successRate: 1.0,
    totalSteps: 5,
    completedSteps: 5,
    failedSteps: 0,
    retryCount: 0,
    agentUtilization: {
      "agent-1": 0.8,
      "agent-2": 0.6,
    },
  };

  it("renders loading state", () => {
    render(<ExecutionMetricsCards isLoading={true} />);
    expect(screen.getByText("Loading metrics…")).toBeInTheDocument();
  });

  it("renders null when no metrics provided and not loading", () => {
    const { container } = render(<ExecutionMetricsCards />);
    expect(container.firstChild).toBeNull();
  });

  it("displays total duration", () => {
    render(<ExecutionMetricsCards metrics={mockMetrics} />);
    expect(screen.getByText("Total Duration")).toBeInTheDocument();
    expect(screen.getByText("1m 0s")).toBeInTheDocument();
  });

  it("displays success rate as percentage", () => {
    render(<ExecutionMetricsCards metrics={mockMetrics} />);
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("displays steps completed count", () => {
    render(<ExecutionMetricsCards metrics={mockMetrics} />);
    expect(screen.getByText("Steps Completed")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("displays retry count", () => {
    render(<ExecutionMetricsCards metrics={mockMetrics} />);
    expect(screen.getByText("Retries")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("formats different durations correctly", () => {
    const metricsWithDifferentDuration: ExecutionMetrics = {
      ...mockMetrics,
      totalDuration: 3661000, // 1 hour, 1 minute, 1 second
    };
    render(<ExecutionMetricsCards metrics={metricsWithDifferentDuration} />);
    expect(screen.getByText("61m 1s")).toBeInTheDocument();
  });

  it("handles partial success", () => {
    const partialSuccess: ExecutionMetrics = {
      ...mockMetrics,
      completedSteps: 3,
      failedSteps: 2,
      successRate: 0.6,
    };
    render(<ExecutionMetricsCards metrics={partialSuccess} />);
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("handles retries", () => {
    const withRetries: ExecutionMetrics = {
      ...mockMetrics,
      retryCount: 3,
    };
    render(<ExecutionMetricsCards metrics={withRetries} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders all four metric cards", () => {
    render(<ExecutionMetricsCards metrics={mockMetrics} />);
    const cards = document.querySelectorAll("[class*='rounded-lg border']");
    // Should have at least 4 cards
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("rounds success rate to nearest percent", () => {
    const almostFull: ExecutionMetrics = {
      ...mockMetrics,
      completedSteps: 4,
      failedSteps: 1,
      successRate: 0.8,
    };
    render(<ExecutionMetricsCards metrics={almostFull} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("formats short durations in milliseconds", () => {
    const shortDuration: ExecutionMetrics = {
      ...mockMetrics,
      totalDuration: 250,
    };
    render(<ExecutionMetricsCards metrics={shortDuration} />);
    expect(screen.getByText("250ms")).toBeInTheDocument();
  });

  it("formats medium durations in seconds", () => {
    const mediumDuration: ExecutionMetrics = {
      ...mockMetrics,
      totalDuration: 35000,
    };
    render(<ExecutionMetricsCards metrics={mediumDuration} />);
    expect(screen.getByText("35s")).toBeInTheDocument();
  });
});
