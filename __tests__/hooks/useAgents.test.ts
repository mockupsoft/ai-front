import { renderHook } from "@testing-library/react";
import { useAgents, useAgentForTask } from "@/hooks/useAgents";
import * as workspaceContext from "@/lib/mgx/workspace/workspace-context";
import useSWR from "swr";

jest.mock("swr");
jest.mock("@/lib/mgx/workspace/workspace-context");

describe("useAgents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial empty state when workspace is not available", () => {
    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: null,
      currentProject: null,
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAgents());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.agents).toBeUndefined();
    expect(result.current.counts).toEqual({
      total: 0,
      active: 0,
      idle: 0,
      executing: 0,
      error: 0,
      offline: 0,
    });
  });

  it("fetches agents and calculates counts", () => {
    const mockAgents = [
      { id: "agent-1", name: "Agent 1", status: "active" as const, definitionId: "def-1" },
      { id: "agent-2", name: "Agent 2", status: "idle" as const, definitionId: "def-2" },
      { id: "agent-3", name: "Agent 3", status: "error" as const, definitionId: "def-3" },
    ];

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: mockAgents,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAgents());

    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.counts).toEqual({
      total: 3,
      active: 1,
      idle: 1,
      executing: 0,
      error: 1,
      offline: 0,
    });
  });

  it("filters agents by taskId when provided", () => {
    const mockAgents = [
      {
        id: "agent-1",
        name: "Agent 1",
        status: "active" as const,
        taskId: "task-1",
        definitionId: "def-1",
      },
      {
        id: "agent-2",
        name: "Agent 2",
        status: "idle" as const,
        taskId: "task-2",
        definitionId: "def-2",
      },
    ];

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: mockAgents,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAgents({ taskId: "task-1" }));

    expect(result.current.agents?.length).toBe(1);
    expect(result.current.agents?.[0].taskId).toBe("task-1");
  });
});

describe("useAgentForTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns agents for specific task", () => {
    const mockAgents = [
      {
        id: "agent-1",
        name: "Agent 1",
        status: "active" as const,
        taskId: "task-1",
        runId: "run-1",
        definitionId: "def-1",
      },
    ];

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: mockAgents,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() =>
      useAgentForTask("task-1", "run-1")
    );

    expect(result.current.agents?.length).toBe(1);
    expect(result.current.agents?.[0].taskId).toBe("task-1");
    expect(result.current.agents?.[0].runId).toBe("run-1");
  });
});
