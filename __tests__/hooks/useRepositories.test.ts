import { renderHook } from "@testing-library/react";
import { useRepositories } from "@/hooks/useRepositories";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import useSWR from "swr";

// Mock dependencies
jest.mock("@/lib/mgx/workspace/workspace-context");
jest.mock("swr");

describe("useRepositories", () => {
  const mockWorkspace = { id: "ws-123", name: "Test Workspace" };
  const mockProject = { id: "proj-456", name: "Test Project" };
  
  const mockSWRResponse = {
    data: [],
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: mockWorkspace,
      currentProject: mockProject,
    });

    (useSWR as jest.Mock).mockReturnValue(mockSWRResponse);
  });

  it("should return repositories data", () => {
    const mockData = [{ id: "repo-1", name: "Test Repo" }];
    (useSWR as jest.Mock).mockReturnValue({
      ...mockSWRResponse,
      data: mockData,
    });

    const { result } = renderHook(() => useRepositories());
    
    expect(result.current.repositories).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("should construct correct cache key with workspace context", () => {
    renderHook(() => useRepositories());
    
    expect(useSWR).toHaveBeenCalledWith(
      [
        "/api/projects/proj-456/repositories",
        expect.objectContaining({
          workspaceId: "ws-123",
          projectId: "proj-456",
        })
      ],
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should return null key when project or workspace is missing", () => {
    (useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: null,
      currentProject: null,
    });

    renderHook(() => useRepositories());
    
    expect(useSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch");
    (useSWR as jest.Mock).mockReturnValue({
      ...mockSWRResponse,
      error: mockError,
    });

    const { result } = renderHook(() => useRepositories());
    
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it("should pass options to SWR", () => {
    const options = { refreshInterval: 5000 };
    renderHook(() => useRepositories(options));
    
    expect(useSWR).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        refreshInterval: 5000,
      })
    );
  });
});
