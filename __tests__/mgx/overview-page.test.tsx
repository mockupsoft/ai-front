import React from "react";
import { render, screen } from "@testing-library/react";

import MgxOverviewPage from "@/app/mgx/page";
import * as agentHooks from "@/hooks/useAgents";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <Link href={href}>{children}</Link>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

jest.mock("@/hooks/useAgents");

describe("MgxOverviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (agentHooks.useAgents as jest.Mock).mockReturnValue({
      agents: [],
      counts: { total: 0, active: 0, idle: 0, executing: 0, error: 0, offline: 0 },
      isLoading: false,
    });
  });

  it("renders overview heading", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("MGX Overview")).toBeInTheDocument();
  });

  it("renders all dashboard cards", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
    expect(screen.getByText("Results")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
  });

  it("renders links to sections", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("View tasks")).toBeInTheDocument();
    expect(screen.getByText("View monitoring")).toBeInTheDocument();
    expect(screen.getByText("View results")).toBeInTheDocument();
  });

  it("shows live indicator", () => {
    render(<MgxOverviewPage />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("displays agent metrics summary", () => {
    (agentHooks.useAgents as jest.Mock).mockReturnValue({
      agents: [],
      counts: { total: 5, active: 2, idle: 2, executing: 0, error: 1, offline: 0 },
      isLoading: false,
    });

    render(<MgxOverviewPage />);
    expect(screen.getByText("Agent Activity")).toBeInTheDocument();
  });
});
