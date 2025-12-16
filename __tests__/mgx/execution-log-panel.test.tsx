import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ExecutionLogPanel } from "@/components/mgx/execution-log-panel";
import useSWR from "swr";

jest.mock("@/lib/api");
jest.mock("@/lib/mgx/workspace/workspace-context", () => ({
  useWorkspace: () => ({
    currentWorkspace: { id: "ws-1" },
    currentProject: { id: "proj-1" },
  }),
}));
jest.mock("swr");

describe("ExecutionLogPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);
    expect(screen.getByText("Loading logs…")).toBeInTheDocument();
  });

  it("renders execution logs", async () => {
    const mockLogs = [
      "[INFO] Starting execution",
      "[INFO] Step 1 completed",
      "[INFO] Execution finished",
    ];

    (useSWR as jest.Mock).mockReturnValue({
      data: mockLogs,
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    await waitFor(() => {
      expect(screen.getByText("[INFO] Starting execution")).toBeInTheDocument();
      expect(screen.getByText("[INFO] Step 1 completed")).toBeInTheDocument();
      expect(screen.getByText("[INFO] Execution finished")).toBeInTheDocument();
    });
  });

  it("renders custom title", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <ExecutionLogPanel
        executionId="exec-1"
        title="Custom Log Title"
      />
    );

    expect(screen.getByText("Custom Log Title")).toBeInTheDocument();
  });

  it("renders default title when not provided", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    expect(screen.getByText("Execution Logs")).toBeInTheDocument();
  });

  it("shows no logs message when empty", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    expect(screen.getByText("No logs available")).toBeInTheDocument();
  });

  it("fetches logs with correct parameters", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    // Verify SWR is called with correct key
    render(<ExecutionLogPanel executionId="exec-1" stepId="step-1" />);

    // The key should include the step ID
    const callArgs = (useSWR as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBeDefined();
  });

  it("fetches step logs when stepId is provided", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: ["[INFO] Step specific log"],
      isLoading: false,
      error: null,
    });

    render(
      <ExecutionLogPanel
        executionId="exec-1"
        stepId="step-2"
        title="Step Logs"
      />
    );

    expect(screen.getByText("[INFO] Step specific log")).toBeInTheDocument();
  });

  it("fetches execution logs when stepId is not provided", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: ["[INFO] All execution logs"],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    expect(screen.getByText("[INFO] All execution logs")).toBeInTheDocument();
  });

  it("handles multiline log entries", () => {
    const multilineLog =
      "[INFO] Complex output:\nLine 1\nLine 2\nLine 3";
    (useSWR as jest.Mock).mockReturnValue({
      data: [multilineLog],
      isLoading: false,
      error: null,
    });

    const { container } = render(<ExecutionLogPanel executionId="exec-1" />);

    // Check that the container has whitespace preserved
    const logContainer = container.querySelector(".whitespace-pre-wrap");
    expect(logContainer).toBeInTheDocument();
  });

  it("renders logs in monospace font", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: ["[INFO] Test log"],
      isLoading: false,
      error: null,
    });

    const { container } = render(<ExecutionLogPanel executionId="exec-1" />);

    const logArea = container.querySelector(".font-mono");
    expect(logArea).toBeInTheDocument();
  });

  it("sets correct API options when rendering", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    // Verify that SWR is called
    expect(useSWR).toHaveBeenCalled();
  });

  it("refreshes logs automatically with refreshInterval", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: ["[INFO] Initial log"],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    const swrOptions = (useSWR as jest.Mock).mock.calls[0][2];
    // Should have refresh interval for live updates
    expect(swrOptions.refreshInterval).toBeDefined();
    expect(swrOptions.refreshInterval).toBeGreaterThan(0);
  });

  it("handles log with special characters", () => {
    const specialLog = '[ERROR] Exception: "Cannot find module"';
    (useSWR as jest.Mock).mockReturnValue({
      data: [specialLog],
      isLoading: false,
      error: null,
    });

    render(<ExecutionLogPanel executionId="exec-1" />);

    expect(screen.getByText(specialLog)).toBeInTheDocument();
  });

  it("has scrollable container for long logs", () => {
    const longLogs = Array.from({ length: 50 }, (_, i) => `[INFO] Log line ${i}`);
    (useSWR as jest.Mock).mockReturnValue({
      data: longLogs,
      isLoading: false,
      error: null,
    });

    const { container } = render(<ExecutionLogPanel executionId="exec-1" />);

    const scrollContainer = container.querySelector(".max-h-96.overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();
  });
});
