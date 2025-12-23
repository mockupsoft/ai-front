import React from "react";
import { render, screen } from "@testing-library/react";

import { MgxHeader } from "@/components/mgx/header";
import { WorkspaceProvider } from "@/lib/mgx/workspace/workspace-context";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/mgx"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock("@/components/mgx/workspace-switcher", () => ({
  WorkspaceSwitcher: () => <div data-testid="workspace-switcher">Workspace Switcher</div>,
}));

jest.mock("@/hooks/useWorkspaces", () => ({
  useWorkspaces: () => ({
    workspaces: [],
    currentWorkspace: null,
    filteredWorkspaces: [],
    health: null,
    isLoading: false,
    isError: false,
    error: null,
    searchTerm: "",
    retry: jest.fn(),
    setSearchTerm: jest.fn(),
    switchWorkspace: jest.fn(),
    createWorkspace: jest.fn(),
  }),
}));

jest.mock("@/lib/api", () => ({
  fetcher: jest.fn(),
}));

describe("MgxHeader", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("renders search input", () => {
    render(
      <WorkspaceProvider>
        <MgxHeader />
      </WorkspaceProvider>
    );
    const searchInput = screen.getByPlaceholderText("Search (placeholder)");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders user information", () => {
    render(
      <WorkspaceProvider>
        <MgxHeader />
      </WorkspaceProvider>
    );
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("mgx@example.com")).toBeInTheDocument();
  });

  it("renders notification button", () => {
    render(
      <WorkspaceProvider>
        <MgxHeader />
      </WorkspaceProvider>
    );
    const notificationButton = screen.getByLabelText("Notifications");
    expect(notificationButton).toBeInTheDocument();
  });

  it("renders environment badge in development", () => {
    process.env.NODE_ENV = "development";
    render(
      <WorkspaceProvider>
        <MgxHeader />
      </WorkspaceProvider>
    );
    expect(screen.getByText("DEV")).toBeInTheDocument();
  });

  it("renders environment badge in production", () => {
    process.env.NODE_ENV = "production";
    render(
      <WorkspaceProvider>
        <MgxHeader />
      </WorkspaceProvider>
    );
    expect(screen.getByText("PROD")).toBeInTheDocument();
  });
});
