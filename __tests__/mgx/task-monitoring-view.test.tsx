import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import * as sonner from "sonner";

import { TaskMonitoringView } from "@/components/mgx/task-monitoring-view";
import * as taskHooks from "@/hooks/useTasks";
import * as wsProvider from "@/components/WebSocketProvider";

jest.mock("@/hooks/useTasks");
jest.mock("@/components/WebSocketProvider");
jest.mock("@/components/AgentChat", () => ({
  AgentChat: () => <div>Agent Chat Mock</div>,
}));
jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <pre>{children}</pre>,
}));
jest.mock("sonner");

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

  it("displays git metadata when WebSocket git event arrives", async () => {
    const subscribeMock = jest.fn();
    const gitMessage = {
      type: "git_metadata_updated",
      payload: {
        branch: "feature/api",
        commitSha: "abc123def456ghi789",
        prNumber: 42,
        prUrl: "https://github.com/test/repo/pull/42",
      },
    };

    const wsMockModule = wsProvider as unknown as { useWebSocket: jest.Mock };
    wsMockModule.useWebSocket.mockReturnValue({
      lastMessage: gitMessage,
      isConnected: true,
      subscribe: subscribeMock,
    });

    render(<TaskMonitoringView taskId="1" />);

    await waitFor(() => {
      expect(screen.getByText("feature/api")).toBeInTheDocument();
    });
  });

  it("shows git metadata badge with branch and commit", async () => {
    const subscribeMock = jest.fn();
    const gitMessage = {
      type: "git_event",
      payload: {
        branch: "main",
        commitSha: "1234567890abcdef",
      },
    };

    const wsMockModule = wsProvider as unknown as { useWebSocket: jest.Mock };
    wsMockModule.useWebSocket.mockReturnValue({
      lastMessage: gitMessage,
      isConnected: true,
      subscribe: subscribeMock,
    });

    render(<TaskMonitoringView taskId="1" />);

    await waitFor(() => {
      expect(screen.getByText("main")).toBeInTheDocument();
      const mockToast = sonner.toast as jest.Mocked<typeof sonner.toast>;
      expect(mockToast.success).toHaveBeenCalledWith("Git metadata updated");
    });
  });
});
