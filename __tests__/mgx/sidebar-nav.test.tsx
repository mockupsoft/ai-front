import React from "react";
import { render, screen } from "@testing-library/react";

import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/mgx"),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("MgxSidebarNav", () => {
  it("renders all navigation items", () => {
    render(<MgxSidebarNav />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getAllByText("Monitoring").length).toBeGreaterThan(0);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders navigation groups", () => {
    render(<MgxSidebarNav />);

    expect(screen.getByText(/management/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });

  it("renders horizontal variant without groups", () => {
    render(<MgxSidebarNav variant="horizontal" />);

    expect(screen.queryByText("MANAGEMENT")).not.toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });
});
