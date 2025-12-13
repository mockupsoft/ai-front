import React from "react";
import { render, screen } from "@testing-library/react";
import { GitMetadataBadge } from "@/components/mgx/git-metadata-badge";
import type { GitMetadata } from "@/lib/types";

jest.mock("lucide-react", () => ({
  ExternalLink: ({ className }: { className?: string }) => (
    <span className={className}>ExternalLink</span>
  ),
  GitBranch: ({ className }: { className?: string }) => (
    <span className={className}>GitBranch</span>
  ),
  GitCommit: ({ className }: { className?: string }) => (
    <span className={className}>GitCommit</span>
  ),
}));

describe("GitMetadataBadge", () => {
  it("renders nothing when metadata is undefined", () => {
    const { container } = render(<GitMetadataBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders branch badge", () => {
    const metadata: GitMetadata = {
      branch: "main",
    };

    render(<GitMetadataBadge metadata={metadata} />);
    expect(screen.getByText("main")).toBeInTheDocument();
  });

  it("renders commit SHA badge with short format", () => {
    const metadata: GitMetadata = {
      commitSha: "abc123def456ghi789",
    };

    render(<GitMetadataBadge metadata={metadata} />);
    expect(screen.getByText("abc123d")).toBeInTheDocument();
  });

  it("renders PR link badge with external link", () => {
    const metadata: GitMetadata = {
      prUrl: "https://github.com/test/repo/pull/42",
      prNumber: 42,
    };

    render(<GitMetadataBadge metadata={metadata} />);
    expect(screen.getByText(/PR #42/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/test/repo/pull/42"
    );
  });

  it("renders all badges together", () => {
    const metadata: GitMetadata = {
      branch: "feature/new-api",
      commitSha: "abc123def456ghi789",
      prUrl: "https://github.com/test/repo/pull/99",
      prNumber: 99,
    };

    render(<GitMetadataBadge metadata={metadata} />);
    expect(screen.getByText("feature/new-api")).toBeInTheDocument();
    expect(screen.getByText("abc123d")).toBeInTheDocument();
    expect(screen.getByText(/PR #99/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const metadata: GitMetadata = {
      branch: "main",
    };

    const { container } = render(
      <GitMetadataBadge metadata={metadata} className="custom-class" />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
