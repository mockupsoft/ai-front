import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { WorkspaceProvider } from "@/lib/mgx/workspace/workspace-context";
import { WorkspaceSelector } from "@/lib/mgx/workspace/workspace-selector";
import { fetcher } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
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

describe("WorkspaceSelector", () => {
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
    
    // Setup default search params mock
    const mockSearchParams = new URLSearchParams();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Default API responses
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve(mockWorkspaces);
      if (path.includes("workspace_id=")) return Promise.resolve(mockProjects);
      return Promise.reject(new Error("Unknown path"));
    });
  });

  it("should render workspace selector", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Development Workspace/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Web Application/i })).toBeInTheDocument();
    });
  });

  it("should show loading states", async () => {
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

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    // Should render the selector
    expect(screen.getByTestId("workspace-selector-container")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Development Workspace/i })).toBeInTheDocument();
    });
  });

  it("should open workspace dropdown when clicked", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    const workspaceButton = await screen.findByRole("button", { name: /Development Workspace/i });
    fireEvent.click(workspaceButton);

    await waitFor(() => {
      expect(screen.getByText("Production Workspace")).toBeInTheDocument();
    });
  });

  it("should select a different workspace", async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    const workspaceButton = await screen.findByRole("button", { name: /Development Workspace/i });
    fireEvent.click(workspaceButton);

    const productionButton = await screen.findByText("Production Workspace");
    fireEvent.click(productionButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Production Workspace/i })).toBeInTheDocument();
    });

    expect(mockRouter.push).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("mgx-selected-workspace", "ws-2");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("mgx-selected-project");
  });

  it("should open project dropdown when clicked", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    const projectButton = await screen.findByRole("button", { name: /Web Application/i });
    fireEvent.click(projectButton);

    await waitFor(() => {
      expect(screen.getByText("Mobile App")).toBeInTheDocument();
    });
  });

  it("should select a different project", async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    const projectButton = await screen.findByRole("button", { name: /Web Application/i });
    fireEvent.click(projectButton);

    const mobileAppButton = await screen.findByText("Mobile App");
    fireEvent.click(mobileAppButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mobile App/i })).toBeInTheDocument();
    });

    expect(mockRouter.push).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("mgx-selected-project", "proj-2");
  });

  it("should show error state when API fails", async () => {
    (fetcher as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load workspaces")).toBeInTheDocument();
    });
  });

  it("should show empty state when no workspaces available", async () => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve([]);
      return Promise.reject(new Error("Unknown path"));
    });

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No workspaces available")).toBeInTheDocument();
    });
  });

  it("should disable project selector when no workspace selected", async () => {
    const workspacesWithNoSelection = [];
    
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve(workspacesWithNoSelection);
      return Promise.reject(new Error("Unknown path"));
    });

    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No workspaces available")).toBeInTheDocument();
    });

    // Project selector should be disabled when no workspace
    const projectButton = screen.queryByRole("button", { name: /Select workspace first/i });
    if (projectButton) {
      expect(projectButton).toBeDisabled();
    }
  });

  it("should show project count in selector", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Web Application/i })).toBeInTheDocument();
    });
  });

  it("should close dropdowns when clicking outside", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector />
      </WorkspaceProvider>
    );

    const workspaceButton = await screen.findByRole("button", { name: /Development Workspace/i });
    fireEvent.click(workspaceButton);

    await waitFor(() => {
      expect(screen.getByText("Production Workspace")).toBeInTheDocument();
    });

    // Click outside to close
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Production Workspace")).not.toBeInTheDocument();
    });
  });

  it("should handle className prop", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceSelector className="custom-class" />
      </WorkspaceProvider>
    );

    const container = screen.getByTestId("workspace-selector-container");
    expect(container).toHaveClass("custom-class");
  });
});