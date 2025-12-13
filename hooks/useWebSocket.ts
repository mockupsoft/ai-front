"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { MGX_WS_URL } from "@/lib/mgx/env";
import { useMgxWebSocket } from "@/lib/mgx/hooks/useMgxWebSocket";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import type { WebSocketMessage } from "@/lib/types";

export type WebSocketSubscription = {
  taskId?: string;
  runId?: string;
  topics?: string[];
};

export type UseWebSocketOptions = {
  url?: string;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
};

function isWebSocketMessage(value: unknown): value is WebSocketMessage {
  if (!value || typeof value !== "object") return false;
  return "type" in value && "payload" in value;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { url = MGX_WS_URL, enabled = true, pauseWhenHidden = true } = options;
  const { currentWorkspace, currentProject } = useWorkspace();

  const subscriptionsRef = useRef<WebSocketSubscription[]>([]);

  const ws = useMgxWebSocket<unknown>({
    url,
    enabled,
    pauseWhenHidden,
  });

  const isConnected = ws.status === "open";

  const lastMessage = useMemo(() => {
    return isWebSocketMessage(ws.lastMessage) ? ws.lastMessage : null;
  }, [ws.lastMessage]);

  const sendMessage = useCallback(
    (msg: unknown) => {
      return ws.send(msg);
    },
    [ws],
  );

  const subscribe = useCallback(
    (subscription: WebSocketSubscription) => {
      // Enhance subscription with workspace/project context
      const scopedSubscription: WebSocketSubscription = {
        ...subscription,
        // Add workspace and project context for server-side filtering
        ...(currentWorkspace && { workspaceId: currentWorkspace.id }),
        ...(currentProject && { projectId: currentProject.id }),
      };

      const key = JSON.stringify(scopedSubscription);
      const existing = subscriptionsRef.current.some((s) => JSON.stringify(s) === key);
      if (!existing) {
        subscriptionsRef.current = [...subscriptionsRef.current, scopedSubscription];
      }

      if (isConnected) {
        sendMessage({ type: "subscribe", payload: scopedSubscription });
      }
    },
    [isConnected, sendMessage, currentWorkspace, currentProject],
  );

  // Resubscribe when workspace/project context changes
  useEffect(() => {
    if (!isConnected) return;
    
    // Clear existing subscriptions and resend with new context
    subscriptionsRef.current = subscriptionsRef.current.map(sub => ({
      ...sub,
      ...(currentWorkspace && { workspaceId: currentWorkspace.id }),
      ...(currentProject && { projectId: currentProject.id }),
    }));

    for (const sub of subscriptionsRef.current) {
      sendMessage({ type: "subscribe", payload: sub });
    }
  }, [isConnected, sendMessage, currentWorkspace, currentProject]);

  return {
    status: ws.status,
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    disconnect: ws.disconnect,
    connect: ws.connect,
  };
}
