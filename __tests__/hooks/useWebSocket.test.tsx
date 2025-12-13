import React from "react";
import { render, screen } from "@testing-library/react";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useMgxWebSocket } from "@/lib/mgx/hooks/useMgxWebSocket";

jest.mock("@/lib/mgx/hooks/useMgxWebSocket");

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

    function Test() {
      const { lastMessage, subscribe } = useWebSocket();

      React.useEffect(() => {
        subscribe({ taskId: "t1" });
      }, [subscribe]);

      return <div>{lastMessage?.type ?? "none"}</div>;
    }

    render(<Test />);

    expect(screen.getByText("metrics_update")).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith({ type: "subscribe", payload: { taskId: "t1" } });
  });
});
