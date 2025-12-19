import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMgxWebSocket } from "@/lib/mgx/hooks/useMgxWebSocket";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

// Mock dependencies
jest.mock("@/lib/mgx/hooks/useMgxWebSocket");
jest.mock("@/lib/mgx/workspace/workspace-context");

describe("useWebSocket", () => {
  const mockSend = jest.fn();
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  
  const mockWorkspace = { id: "ws-123", name: "Test Workspace" };
  const mockProject = { id: "proj-456", name: "Test Project" };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useMgxWebSocket
    (useMgxWebSocket as jest.Mock).mockReturnValue({
      status: "open",
      lastMessage: null,
      send: mockSend,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    // Default mock implementation for useWorkspace
    (useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: mockWorkspace,
      currentProject: mockProject,
    });
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.status).toBe("open");
    expect(result.current.isConnected).toBe(true);
    expect(result.current.sendMessage).toBeDefined();
    expect(result.current.subscribe).toBeDefined();
  });

  it("should send subscription message with workspace context", () => {
    const { result } = renderHook(() => useWebSocket());
    
    const subscription = {
      taskId: "task-1",
      topics: ["status"],
    };

    act(() => {
      result.current.subscribe(subscription);
    });

    expect(mockSend).toHaveBeenCalledWith({
      type: "subscribe",
      payload: expect.objectContaining({
        taskId: "task-1",
        workspaceId: "ws-123",
        projectId: "proj-456",
      }),
    });
  });

  it("should resubscribe when workspace context changes", () => {
    // Initial render
    const { result, rerender } = renderHook(() => useWebSocket());
    
    // Subscribe
    act(() => {
      result.current.subscribe({ taskId: "task-1" });
    });
    
    expect(mockSend).toHaveBeenCalledTimes(1);
    
    // Change workspace
    (useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "ws-789" },
      currentProject: null,
    });
    
    rerender();
    
    // Should verify if useEffect triggered resubscribe
    // Since mockSend is called inside useEffect, it should be called again
    
    expect(mockSend).toHaveBeenCalledWith({
      type: "subscribe",
      payload: expect.objectContaining({
        taskId: "task-1",
        workspaceId: "ws-789",
      }),
    });
  });

  it("should filter valid WebSocket messages", () => {
    const mockMessage = { type: "test", payload: "data" };
    (useMgxWebSocket as jest.Mock).mockReturnValue({
      status: "open",
      lastMessage: mockMessage,
      send: mockSend,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.lastMessage).toEqual(mockMessage);
  });

  it("should ignore invalid WebSocket messages", () => {
    // Message without type/payload
    (useMgxWebSocket as jest.Mock).mockReturnValue({
      status: "open",
      lastMessage: "invalid string message",
      send: mockSend,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.lastMessage).toBeNull();
  });
});
