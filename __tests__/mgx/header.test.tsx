import React from "react";
import { render, screen } from "@testing-library/react";

import { MgxHeader } from "@/components/mgx/header";
import { WorkspaceProvider } from "@/lib/mgx/workspace/workspace-context";

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
