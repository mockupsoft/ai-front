import { 
  fetcher, 
  createTask, 
  connectRepository, 
  fetchWorkflowExecutions, 
  ApiRequestOptions,
  triggerRun
} from "@/lib/api";

// Reset fetch mock before each test
beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

describe("API Service Layer", () => {
  const mockOptions: ApiRequestOptions = {
    workspaceId: "ws-123",
    projectId: "proj-456",
  };

  describe("fetcher", () => {
    it("should make a GET request to the correct URL", async () => {
      await fetcher("/test-path");
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-path"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should include workspace and project headers when provided", async () => {
      await fetcher("/test-path", mockOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-path"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Workspace-Id": "ws-123",
            "X-Project-Id": "proj-456",
          }),
        })
      );
    });

    it("should append workspace_id and project_id to query params", async () => {
      await fetcher("/test-path", mockOptions);
      
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      const url = new URL(calledUrl);
      
      expect(url.searchParams.get("workspace_id")).toBe("ws-123");
      expect(url.searchParams.get("project_id")).toBe("proj-456");
    });
    
    it("should handle error responses", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

      await expect(fetcher("/test-path")).rejects.toThrow("An error occurred while fetching the data.");
    });
  });

  describe("createTask", () => {
    it("should POST to /tasks with correct body", async () => {
      await createTask("New Task", "Description");
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/tasks"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "New Task", description: "Description" }),
        })
      );
    });
  });
  
  describe("triggerRun", () => {
    it("should POST to /tasks/:id/run with correct headers", async () => {
      await triggerRun("task-1", mockOptions);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/tasks/task-1/run"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Workspace-Id": "ws-123",
          }),
        })
      );
    });
  });

  describe("connectRepository", () => {
    it("should POST to correct project-scoped URL", async () => {
      const repoData = {
        url: "https://github.com/test/repo",
        branch: "main",
        oauthToken: "token",
      };
      
      await connectRepository("proj-456", repoData, mockOptions);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects/proj-456/repositories/connect"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(repoData),
        })
      );
    });
  });

  describe("fetchWorkflowExecutions", () => {
    it("should handle pagination parameters", async () => {
      await fetchWorkflowExecutions("wf-1", 10, 20, mockOptions);
      
      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      const url = new URL(calledUrl);
      
      expect(url.searchParams.get("limit")).toBe("10");
      expect(url.searchParams.get("offset")).toBe("20");
    });
  });
});
