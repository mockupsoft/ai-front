'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import {
  useWebSocket as useWsConnection,
  type WebSocketSubscription,
} from '@/hooks/useWebSocket';
import type { WebSocketMessage } from '@/lib/types';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (msg: unknown) => void;
  subscribe?: (subscription: WebSocketSubscription) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, lastMessage, sendMessage: send, subscribe } = useWsConnection();

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'plan_ready':
        toast.info('Plan is ready for approval');
        break;
      case 'run_completed':
        toast.success('Run completed successfully');
        break;
      case 'run_failed':
        toast.error('Run failed');
        break;
    }
  }, [lastMessage]);

  const value = useMemo(
    () => ({
      isConnected,
      lastMessage,
      sendMessage: (msg: unknown) => {
        void send(msg);
      },
      subscribe: subscribe
        ? (s: WebSocketSubscription) => {
            subscribe(s);
          }
        : undefined,
    }),
    [isConnected, lastMessage, send, subscribe],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
