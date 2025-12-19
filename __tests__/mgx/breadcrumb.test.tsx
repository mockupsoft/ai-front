import React from "react";
import { render, screen } from "@testing-library/react";

import { MgxBreadcrumb } from "@/components/mgx/breadcrumb";
import { WorkspaceProvider } from "@/lib/mgx/workspace/workspace-context";
import { fetcher } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  fetcher: jest.fn(),
}));

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <Link href={href}>{children}</Link>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("MgxBreadcrumb", () => {
  beforeEach(() => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve([]);
      return Promise.reject(new Error("Unknown path"));
    });
  });

  it("renders nothing on home page", () => {
    mockUsePathname.mockReturnValue("/mgx");
    const { container } = render(
      <WorkspaceProvider>
        <MgxBreadcrumb />
      </WorkspaceProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders breadcrumbs for nested routes", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks");
    render(
      <WorkspaceProvider>
        <MgxBreadcrumb />
      </WorkspaceProvider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("renders breadcrumbs for task detail", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks/123");
    render(
      <WorkspaceProvider>
        <MgxBreadcrumb />
      </WorkspaceProvider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("applies correct link styling", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks");
    render(
      <WorkspaceProvider>
        <MgxBreadcrumb />
      </WorkspaceProvider>
    );

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/mgx");
  });
});
