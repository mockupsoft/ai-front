import React from "react";
import { render, screen } from "@testing-library/react";

import { TaskMonitor } from "@/components/mgx/task-monitor";

describe("TaskMonitor", () => {
  it("renders progress and timeline", () => {
    render(
      <TaskMonitor
        status="running"
        phase="plan"
        progress={0.5}
        currentAction="Creating plan"
        startedAt={new Date(Date.now() - 5000).toISOString()}
      />,
    );

    expect(screen.getByText("Live monitor")).toBeInTheDocument();
    expect(screen.getByText("Creating plan")).toBeInTheDocument();

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");

    expect(screen.getByText("Analyze")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Execute")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });
});
