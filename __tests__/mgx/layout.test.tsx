import React from "react";
import { render, screen } from "@testing-library/react";

import MgxLayout from "@/app/mgx/layout";
import { fetcher } from "@/lib/api";

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

jest.mock("@/lib/api", () => ({
  fetcher: jest.fn(),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("MgxLayout", () => {
  beforeEach(() => {
    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve([]);
      return Promise.reject(new Error("Unknown path"));
    });
  });

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