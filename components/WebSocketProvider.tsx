'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { WebSocketMessage } from '@/lib/types';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (msg: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WS Connected');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
      setIsConnected(false);
      // Reconnect logic
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Reconnecting WS...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WS Error', error);
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);

        // Handle global toasts for major events
        switch (message.type) {
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

      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const sendMessage = (msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('WS not connected, cannot send message');
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
