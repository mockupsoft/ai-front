import { render, screen, waitFor } from "@testing-library/react";
import { ActivityFeed } from "@/components/mgx/activity-feed";
import { useActivityFeed } from "@/hooks/useActivityFeed";

jest.mock("@/hooks/useActivityFeed");

describe("ActivityFeed", () => {
  const mockUseActivityFeed = useActivityFeed as jest.MockedFunction<typeof useActivityFeed>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseActivityFeed.mockReturnValue({
      events: [],
      isLoading: true,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<ActivityFeed linkId="test-link" />);
    expect(screen.getByText("Activity Feed")).toBeInTheDocument();
  });

  it("renders activity events", async () => {
    const mockEvents = [
      {
        id: "commit_abc123",
        type: "commit",
        timestamp: "2024-01-01T12:00:00Z",
        actor: "test-user",
        title: "Test commit",
        body: "Test commit message",
        url: "https://github.com/test/repo/commit/abc123",
        metadata: {},
      },
    ];

    mockUseActivityFeed.mockReturnValue({
      events: mockEvents,
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<ActivityFeed linkId="test-link" />);
    
    await waitFor(() => {
      expect(screen.getByText("Test commit")).toBeInTheDocument();
    });
  });

  it("renders error state", () => {
    mockUseActivityFeed.mockReturnValue({
      events: [],
      isLoading: false,
      isError: true,
      error: new Error("Failed to load"),
      mutate: jest.fn(),
    });

    render(<ActivityFeed linkId="test-link" />);
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });
});


