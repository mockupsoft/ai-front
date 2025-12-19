import { renderHook, waitFor } from "@testing-library/react";
import { useWorkflowExecutions, useWorkflowExecution, useExecutionMetrics } from "@/hooks/useWorkflowExecutions";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { fetchWorkflowExecutions, fetchWorkflowExecution, fetchExecutionMetrics } from "@/lib/api";

// Mock dependencies
jest.mock("@/lib/mgx/workspace/workspace-context");
jest.mock("@/lib/api", () => ({
  fetchWorkflowExecutions: jest.fn(),
  fetchWorkflowExecution: jest.fn(),
  fetchExecutionMetrics: jest.fn(),
}));

describe("Workflow Execution Integration", () => {
  const mockWorkspace = { id: "ws-123", name: "Test Workspace" };
  const mockProject = { id: "proj-456", name: "Test Project" };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: mockWorkspace,
      currentProject: mockProject,
    });
  });

  describe("useWorkflowExecutions", () => {
    it("should fetch executions list", async () => {
      const mockExecutions = [
        { id: "exec-1", status: "running" },
        { id: "exec-2", status: "completed" }
      ];
      
      (fetchWorkflowExecutions as jest.Mock).mockResolvedValue(mockExecutions);

      const { result } = renderHook(() => useWorkflowExecutions("wf-1"));
      
      expect(result.current.isLoading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.executions).toEqual(mockExecutions);
      });
      
      expect(fetchWorkflowExecutions).toHaveBeenCalledWith(
        "wf-1",
        undefined,
        undefined,
        expect.objectContaining({
          workspaceId: "ws-123",
          projectId: "proj-456",
        })
      );
    });
  });

  describe("useWorkflowExecution", () => {
    it("should fetch execution details", async () => {
      const mockExecution = { id: "exec-1", status: "running", steps: [] };
      
      (fetchWorkflowExecution as jest.Mock).mockResolvedValue(mockExecution);

      const { result } = renderHook(() => useWorkflowExecution("exec-1"));
      
      await waitFor(() => {
        expect(result.current.execution).toEqual(mockExecution);
      });
      
      expect(fetchWorkflowExecution).toHaveBeenCalledWith(
        "exec-1",
        expect.objectContaining({
          workspaceId: "ws-123",
        })
      );
    });
  });
  
  describe("useExecutionMetrics", () => {
    it("should fetch metrics", async () => {
      const mockMetrics = { duration: 100, successRate: 0.9 };
      
      (fetchExecutionMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => useExecutionMetrics("exec-1"));
      
      await waitFor(() => {
        expect(result.current.metrics).toEqual(mockMetrics);
      });
      
      expect(fetchExecutionMetrics).toHaveBeenCalledWith(
        "exec-1",
        expect.objectContaining({
          workspaceId: "ws-123",
        })
      );
    });
  });
});
