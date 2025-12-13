import React from "react";
import { render, screen } from "@testing-library/react";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useMgxWebSocket } from "@/lib/mgx/hooks/useMgxWebSocket";
import { WorkspaceProvider } from "@/lib/mgx/workspace/workspace-context";
import { fetcher } from "@/lib/api";

jest.mock("@/lib/mgx/hooks/useMgxWebSocket");
jest.mock("@/lib/api", () => ({
  fetcher: jest.fn(),
}));

describe("useWebSocket", () => {
  it("normalizes lastMessage and sends subscriptions", () => {
    const send = jest.fn().mockReturnValue(true);

    (useMgxWebSocket as jest.Mock).mockReturnValue({
      status: "open",
      lastMessage: { type: "metrics_update", payload: { latency: 1 } },
      send,
      disconnect: jest.fn(),
      connect: jest.fn(),
    });

    (fetcher as jest.Mock).mockImplementation((path: string) => {
      if (path === "/workspaces") return Promise.resolve([]);
      return Promise.reject(new Error("Unknown path"));
    });

    function Test() {
      const { lastMessage, subscribe } = useWebSocket();

      React.useEffect(() => {
        subscribe({ taskId: "t1" });
      }, [subscribe]);

      return <div>{lastMessage?.type ?? "none"}</div>;
    }

    render(
      <WorkspaceProvider>
        <Test />
      </WorkspaceProvider>
    );

    expect(screen.getByText("metrics_update")).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith({ type: "subscribe", payload: { taskId: "t1" } });
  });
});
