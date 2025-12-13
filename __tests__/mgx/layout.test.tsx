import React from "react";
import { render, screen } from "@testing-library/react";

import MgxLayout from "@/app/mgx/layout";

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

describe("MgxLayout", () => {
  it("renders children", () => {
    render(
      <MgxLayout>
        <div>Test Content</div>
      </MgxLayout>,
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders header", () => {
    render(
      <MgxLayout>
        <div>Test Content</div>
      </MgxLayout>,
    );
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders sidebar with app name", () => {
    render(
      <MgxLayout>
        <div>Test Content</div>
      </MgxLayout>,
    );
    expect(screen.getByText("MGX Dashboard")).toBeInTheDocument();
  });

  it("renders navigation items", () => {
    render(
      <MgxLayout>
        <div>Test Content</div>
      </MgxLayout>,
    );
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tasks").length).toBeGreaterThan(0);
  });
});
