import React from "react";
import { render, screen } from "@testing-library/react";

import { TaskMonitoringView } from "@/components/mgx/task-monitoring-view";
import * as taskHooks from "@/hooks/useTasks";
import * as wsProvider from "@/components/WebSocketProvider";

jest.mock("@/hooks/useTasks");
jest.mock("@/components/WebSocketProvider");

describe("TaskMonitoringView", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (taskHooks.useTask as jest.Mock).mockReturnValue({
      task: {
        id: "1",
        name: "Task 1",
        status: "waiting_approval",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
        currentRunId: "run1",
      },
      isLoading: false,
      mutate: jest.fn(),
    });

    (taskHooks.useRun as jest.Mock).mockReturnValue({
      run: {
        id: "run1",
        taskId: "1",
        status: "waiting_approval",
        plan: "Mock Plan",
        logs: ["log 1"],
        artifacts: [],
        createdAt: "2023-01-01T00:00:00Z",
      },
      isLoading: false,
      mutate: jest.fn(),
    });

    (wsProvider.useWebSocket as jest.Mock).mockReturnValue({
      lastMessage: null,
      isConnected: true,
      subscribe: jest.fn(),
      sendMessage: jest.fn(),
    });
  });

  it("renders task header and plan", () => {
    render(<TaskMonitoringView taskId="1" />);

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Mock Plan")).toBeInTheDocument();
    expect(screen.getByText("Review plan")).toBeInTheDocument();
  });
});
