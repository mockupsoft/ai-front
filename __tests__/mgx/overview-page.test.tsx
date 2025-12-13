import React from "react";
import { render, screen } from "@testing-library/react";

import MgxOverviewPage from "@/app/mgx/page";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

describe("MgxOverviewPage", () => {
  it("renders overview heading", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("MGX Overview")).toBeInTheDocument();
  });

  it("renders all dashboard cards", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getByText("WebSocket")).toBeInTheDocument();
  });

  it("renders links to sections", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("View tasks")).toBeInTheDocument();
    expect(screen.getByText("View monitoring")).toBeInTheDocument();
    expect(screen.getByText("View results")).toBeInTheDocument();
  });

  it("shows mock mode indicator", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("Mock mode")).toBeInTheDocument();
  });
});
