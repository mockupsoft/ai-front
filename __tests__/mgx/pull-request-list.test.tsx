import { render, screen, waitFor } from "@testing-library/react";
import { PullRequestList } from "@/components/mgx/pull-request-list";
import { usePullRequests } from "@/hooks/usePullRequests";

jest.mock("@/hooks/usePullRequests");

describe("PullRequestList", () => {
  const mockUsePullRequests = usePullRequests as jest.MockedFunction<typeof usePullRequests>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUsePullRequests.mockReturnValue({
      pullRequests: [],
      isLoading: true,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<PullRequestList linkId="test-link" />);
    expect(screen.getByText("Pull Requests")).toBeInTheDocument();
  });

  it("renders pull requests list", async () => {
    const mockPRs = [
      {
        number: 1,
        title: "Test PR",
        body: "Test body",
        state: "open",
        head_branch: "feature/test",
        base_branch: "main",
        head_sha: "abc123",
        base_sha: "def456",
        html_url: "https://github.com/test/repo/pull/1",
        created_at: "2024-01-01T12:00:00Z",
        updated_at: "2024-01-01T12:00:00Z",
        merged_at: null,
        mergeable: true,
        mergeable_state: "clean",
        author: "test-user",
        labels: ["bug"],
        review_count: 0,
        comment_count: 0,
      },
    ];

    mockUsePullRequests.mockReturnValue({
      pullRequests: mockPRs,
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<PullRequestList linkId="test-link" />);
    
    await waitFor(() => {
      expect(screen.getByText("#1 Test PR")).toBeInTheDocument();
    });
  });

  it("renders error state", () => {
    mockUsePullRequests.mockReturnValue({
      pullRequests: [],
      isLoading: false,
      isError: true,
      error: new Error("Failed to load"),
      mutate: jest.fn(),
    });

    render(<PullRequestList linkId="test-link" />);
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });
});


