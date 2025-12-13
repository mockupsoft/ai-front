import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

import { WorkspaceProvider, useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { fetcher } from "@/lib/api";
import type { Workspace, Project } from "@/lib/types/workspace";

// Mock the API
jest.mock("@/lib/api", () => ({
  fetcher: jest.fn(),
}));

// Mock Next.js hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("WorkspaceProvider", () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: "ws-1",
      name: "Development Workspace",
      description: "Main development workspace",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      userId: "user-1",
      isActive: true,
    },
    {
      id: "ws-2",
      name: "Production Workspace",
      description: "Production environment",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      userId: "user-1",
      isActive: false,
    },
  ];

  const mockProjects: Project[] = [
    {
      id: "proj-1",
      workspaceId: "ws-1",
      name: "Web Application",
      description: "Main web application",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      isActive: true,
    },
    {
      id: "proj-2",
      workspaceId: "ws-1",
      name: "Mobile App",
      description: "Mobile application",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      isActive: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default router mock
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Setup default search params mock
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty state", async () => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve(mockWorkspaces);
      if (path.includes("workspace_id=")) return Promise.resolve(mockProjects);
      return Promise.reject(new Error("Unknown path"));
    });

    const TestComponent = () => {
      const {
        currentWorkspace,
        workspaces,
        projects,
        isLoadingWorkspaces,
      } = useWorkspace();

      return (
        <div>
          <div data-testid="workspace-name">
            {currentWorkspace?.name || "No workspace"}
          </div>
          <div data-testid="project-name">
            {currentProject?.name || "No project"}
          </div>
          <div data-testid="workspace-count">{workspaces.length}</div>
          <div data-testid="project-count">{projects.length}</div>
          <div data-testid="loading-workspaces">
            {isLoadingWorkspaces ? "loading" : "not-loading"}
          </div>
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("workspace-name")).toHaveTextContent("Development Workspace");
      expect(screen.getByTestId("project-name")).toHaveTextContent("Web Application");
      expect(screen.getByTestId("workspace-count")).toHaveTextContent("2");
      expect(screen.getByTestId("project-count")).toHaveTextContent("2");
    });
  });

  it("should select a different workspace", async () => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve(mockWorkspaces);
      if (path.includes("workspace_id=ws-1")) return Promise.resolve(mockProjects);
      if (path.includes("workspace_id=ws-2")) return Promise.resolve([]);
      return Promise.reject(new Error("Unknown path"));
    });

    const TestComponent = () => {
      const {
        currentWorkspace,
        selectWorkspace,
        workspaces,
      } = useWorkspace();

      return (
        <div>
          <div data-testid="current-workspace">{currentWorkspace?.name}</div>
          <button
            data-testid="select-ws-2"
            onClick={() => {
              const ws2 = workspaces.find(w => w.id === "ws-2");
              if (ws2) selectWorkspace(ws2);
            }}
          >
            Select Workspace 2
          </button>
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-workspace")).toHaveTextContent("Development Workspace");
    });

    await userEvent.click(screen.getByTestId("select-ws-2"));

    await waitFor(() => {
      expect(screen.getByTestId("current-workspace")).toHaveTextContent("Production Workspace");
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("mgx-selected-workspace", "ws-2");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("mgx-selected-project");
  });

  it("should handle loading states", async () => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockWorkspaces);
          }, 100);
        });
      }
      if (path.includes("workspace_id=")) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockProjects);
          }, 100);
        });
      }
      return Promise.reject(new Error("Unknown path"));
    });

    const TestComponent = () => {
      const {
        isLoadingWorkspaces,
        isLoadingProjects,
      } = useWorkspace();

      return (
        <div>
          <div data-testid="loading-workspaces">
            {isLoadingWorkspaces ? "loading" : "not-loading"}
          </div>
          <div data-testid="loading-projects">
            {isLoadingProjects ? "loading" : "not-loading"}
          </div>
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    expect(screen.getByTestId("loading-workspaces")).toHaveTextContent("loading");
    expect(screen.getByTestId("loading-projects")).toHaveTextContent("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading-workspaces")).toHaveTextContent("not-loading");
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-projects")).toHaveTextContent("not-loading");
    });
  });

  it("should handle errors gracefully", async () => {
    (fetcher as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    const TestComponent = () => {
      const { error } = useWorkspace();

      return (
        <div>
          <div data-testid="error">
            {error ? error.message : "No error"}
          </div>
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Failed to fetch");
    });
  });

  it("should use localStorage persistence", async () => {
    localStorageMock.getItem.mockReturnValue("ws-1");
    localStorageMock.getItem.mockReturnValueOnce(null); // workspace
    localStorageMock.getItem.mockReturnValueOnce("proj-1"); // project

    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve(mockWorkspaces);
      if (path.includes("workspace_id=ws-1")) return Promise.resolve(mockProjects);
      return Promise.reject(new Error("Unknown path"));
    });

    const TestComponent = () => {
      const { currentWorkspace, currentProject } = useWorkspace();

      return (
        <div>
          <div data-testid="workspace">{currentWorkspace?.name}</div>
          <div data-testid="project">{currentProject?.name}</div>
        </div>
      );
    };

    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("workspace")).toHaveTextContent("Development Workspace");
      expect(screen.getByTestId("project")).toHaveTextContent("Web Application");
    });
  });
});

describe("useWorkspace hook", () => {
  it("should throw error when used outside provider", () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const TestComponent = () => {
      useWorkspace();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useWorkspace must be used within a WorkspaceProvider"
    );

    consoleSpy.mockRestore();
  });
});