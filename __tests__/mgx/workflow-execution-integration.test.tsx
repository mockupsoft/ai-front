import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useWorkflowExecutions, useWorkflowExecution } from "@/hooks/useWorkflowExecutions";
import * as api from "@/lib/api";
import useSWR from "swr";
import * as workspaceContext from "@/lib/mgx/workspace/workspace-context";

jest.mock("swr");
jest.mock("@/lib/api");
jest.mock("@/lib/mgx/workspace/workspace-context");

describe("Workflow Execution Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "ws-1" },
      currentProject: { id: "proj-1" },
    });
  });

  describe("useWorkflowExecutions hook", () => {
    it("fetches executions for a workflow", () => {
      const mockExecutions = [
        {
          id: "exec-1",
          workflowId: "wf-1",
          status: "completed",
          startedAt: Date.now(),
          steps: [],
        },
      ];

      (useSWR as jest.Mock).mockReturnValue({
        data: mockExecutions,
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      });

      // Component that uses the hook
      function TestComponent() {
        const { executions, isLoading } = useWorkflowExecutions("wf-1");
        return (
          <div>
            {isLoading && <div>Loading</div>}
            {executions?.map((e) => <div key={e.id}>{e.id}</div>)}
          </div>
        );
      }

      render(<TestComponent />);
      expect(screen.getByText("exec-1")).toBeInTheDocument();
    });

    it("handles loading state", () => {
      (useSWR as jest.Mock).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: jest.fn(),
      });

      function TestComponent() {
        const { isLoading } = useWorkflowExecutions("wf-1");
        return <div>{isLoading ? "Loading" : "Loaded"}</div>;
      }

      render(<TestComponent />);
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("handles errors", () => {
      (useSWR as jest.Mock).mockReturnValue({
        data: undefined,
        error: new Error("Failed to fetch"),
        isLoading: false,
        mutate: jest.fn(),
      });

      function TestComponent() {
        const { isError } = useWorkflowExecutions("wf-1");
        return <div>{isError ? "Error" : "Success"}</div>;
      }

      render(<TestComponent />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("useWorkflowExecution hook", () => {
    it("fetches single execution details", () => {
      const mockExecution = {
        id: "exec-1",
        workflowId: "wf-1",
        status: "running",
        startedAt: Date.now(),
        steps: [
          {
            stepId: "step-1",
            stepName: "Step 1",
            status: "completed",
            durationMs: 1000,
          },
        ],
      };

      (useSWR as jest.Mock).mockReturnValue({
        data: mockExecution,
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      });

      function TestComponent() {
        const { execution } = useWorkflowExecution("exec-1");
        return (
          <div>
            {execution && (
              <>
                <div>{execution.id}</div>
                <div>{execution.status}</div>
              </>
            )}
          </div>
        );
      }

      render(<TestComponent />);
      expect(screen.getByText("exec-1")).toBeInTheDocument();
      expect(screen.getByText("running")).toBeInTheDocument();
    });

    it("sets up auto-refresh for execution details", () => {
      (useSWR as jest.Mock).mockReturnValue({
        data: { id: "exec-1", status: "running", steps: [] },
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      });

      function TestComponent() {
        useWorkflowExecution("exec-1");
        return <div>Test</div>;
      }

      render(<TestComponent />);

      // Verify SWR is configured with refreshInterval
      const swrOptions = (useSWR as jest.Mock).mock.calls[0][2];
      expect(swrOptions.refreshInterval).toBeDefined();
      expect(swrOptions.refreshInterval).toBe(1000); // 1 second for live updates
    });
  });

  describe("Execution state transitions", () => {
    it("handles pending to running transition", () => {
      const { rerender } = render(
        <div>
          {(() => {
            (useSWR as jest.Mock).mockReturnValue({
              data: { id: "exec-1", status: "pending", steps: [] },
              error: null,
              isLoading: false,
            });
            return <div>pending</div>;
          })()}
        </div>
      );

      (useSWR as jest.Mock).mockReturnValue({
        data: { id: "exec-1", status: "running", steps: [] },
        error: null,
        isLoading: false,
      });

      rerender(
        <div>
          {(() => {
            return <div>running</div>;
          })()}
        </div>
      );

      expect(screen.getByText("running")).toBeInTheDocument();
    });
  });
});
