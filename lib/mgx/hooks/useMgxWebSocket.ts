"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MGX_WS_URL } from "@/lib/mgx/env";

export type MgxWebSocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

export type UseMgxWebSocketOptions<TMessage = unknown> = {
  url?: string;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  onMessage?: (message: TMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
};

export function useMgxWebSocket<TMessage = unknown>(
  options: UseMgxWebSocketOptions<TMessage> = {},
) {
  const {
    url = MGX_WS_URL,
    enabled = true,
    pauseWhenHidden = true,
    reconnectBaseDelayMs = 500,
    reconnectMaxDelayMs = 30_000,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const connectRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<MgxWebSocketStatus>("idle");
  const [lastMessage, setLastMessage] = useState<TMessage | null>(null);

  const isVisible = useMemo(() => {
    if (!pauseWhenHidden) return true;
    if (typeof document === "undefined") return true;
    return document.visibilityState !== "hidden";
  }, [pauseWhenHidden]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    shouldReconnectRef.current = false;

    const ws = wsRef.current;
    wsRef.current = null;

    if (
      ws &&
      (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING)
    ) {
      ws.close();
    }

    setStatus("closed");
  }, [clearReconnectTimer]);

  const scheduleReconnect = useCallback(() => {
    if (!enabled || !isVisible) return;
    if (!shouldReconnectRef.current) return;

    clearReconnectTimer();

    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(
      reconnectBaseDelayMs * Math.pow(2, attempt),
      reconnectMaxDelayMs,
    );

    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = window.setTimeout(() => {
      connectRef.current();
    }, delay);
  }, [
    clearReconnectTimer,
    enabled,
    isVisible,
    reconnectBaseDelayMs,
    reconnectMaxDelayMs,
  ]);

  const connect = useCallback(() => {
    if (!enabled || !isVisible) return;
    if (wsRef.current) return;

    shouldReconnectRef.current = true;
    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      reconnectAttemptRef.current = 0;
      setStatus("open");
      onOpen?.();
    });

    ws.addEventListener("message", (event) => {
      let parsed: TMessage;
      try {
        parsed = JSON.parse(String(event.data)) as TMessage;
      } catch {
        parsed = String(event.data) as TMessage;
      }

      setLastMessage(parsed);
      onMessage?.(parsed);
    });

    ws.addEventListener("close", () => {
      wsRef.current = null;
      setStatus("closed");
      onClose?.();
      scheduleReconnect();
    });

    ws.addEventListener("error", (event) => {
      setStatus("error");
      onError?.(event);
    });
  }, [
    enabled,
    isVisible,
    onClose,
    onError,
    onMessage,
    onOpen,
    scheduleReconnect,
    url,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      connect();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handler = () => {
      if (document.visibilityState === "hidden") {
        disconnect();
      } else {
        wsRef.current = null;
        reconnectAttemptRef.current = 0;
        shouldReconnectRef.current = true;
        connect();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [connect, disconnect, pauseWhenHidden]);

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    ws.send(typeof data === "string" ? data : JSON.stringify(data));
    return true;
  }, []);

  return {
    status,
    lastMessage,
    send,
    disconnect,
    connect,
  };
}
