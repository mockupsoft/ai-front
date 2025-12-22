import { render, screen, waitFor } from "@testing-library/react";
import { IssuesList } from "@/components/mgx/issues-list";
import { useIssues } from "@/hooks/useIssues";

jest.mock("@/hooks/useIssues");

describe("IssuesList", () => {
  const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseIssues.mockReturnValue({
      issues: [],
      isLoading: true,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<IssuesList linkId="test-link" />);
    expect(screen.getByText("Issues")).toBeInTheDocument();
  });

  it("renders issues list", async () => {
    const mockIssues = [
      {
        number: 1,
        title: "Test Issue",
        body: "Test body",
        state: "open",
        html_url: "https://github.com/test/repo/issues/1",
        created_at: "2024-01-01T12:00:00Z",
        updated_at: "2024-01-01T12:00:00Z",
        closed_at: null,
        author: "test-user",
        labels: ["bug"],
        assignees: ["test-user"],
        comment_count: 0,
      },
    ];

    mockUseIssues.mockReturnValue({
      issues: mockIssues,
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<IssuesList linkId="test-link" />);
    
    await waitFor(() => {
      expect(screen.getByText("#1 Test Issue")).toBeInTheDocument();
    });
  });

  it("renders error state", () => {
    mockUseIssues.mockReturnValue({
      issues: [],
      isLoading: false,
      isError: true,
      error: new Error("Failed to load"),
      mutate: jest.fn(),
    });

    render(<IssuesList linkId="test-link" />);
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });
});


