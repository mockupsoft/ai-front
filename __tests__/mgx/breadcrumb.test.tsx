import React from "react";
import { render, screen } from "@testing-library/react";

import { MgxBreadcrumb } from "@/components/mgx/breadcrumb";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("MgxBreadcrumb", () => {
  it("renders nothing on home page", () => {
    mockUsePathname.mockReturnValue("/mgx");
    const { container } = render(<MgxBreadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it("renders breadcrumbs for nested routes", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks");
    render(<MgxBreadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("renders breadcrumbs for task detail", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks/123");
    render(<MgxBreadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("applies correct link styling", () => {
    mockUsePathname.mockReturnValue("/mgx/tasks");
    render(<MgxBreadcrumb />);

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/mgx");
  });
});
