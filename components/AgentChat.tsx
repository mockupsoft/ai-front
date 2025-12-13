'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/components/WebSocketProvider';
import { getAgentMessages, saveAgentMessage } from '@/lib/storage';
import type { AgentMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface AgentChatProps {
  taskId: string;
  runId?: string;
  isRunning?: boolean;
}

export function AgentChat({ taskId, runId, isRunning = false }: AgentChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await getAgentMessages(taskId, runId);
        setMessages(stored.sort((a, b) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [taskId, runId]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'agent_message' || lastMessage.type === 'agent_action') {
      const payload = lastMessage.payload as Partial<AgentMessage>;
      if (payload.taskId === taskId && (!runId || payload.runId === runId)) {
        const newMessage: AgentMessage = {
          id: `${Date.now()}-${Math.random()}`,
          taskId,
          runId,
          agentName: payload.agentName || 'Agent',
          role: (payload.role as AgentMessage['role']) || 'assistant',
          content: payload.content || '',
          timestamp: payload.timestamp || Date.now(),
          actionType: (payload.actionType as AgentMessage['actionType']) || undefined,
        };

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });

        saveAgentMessage(newMessage).catch(console.error);
      }
    }
  }, [lastMessage, taskId, runId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'thinking':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'executing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Agent Chat</h2>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-gray-400"
          )} />
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running...
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No messages yet. Waiting for agent activity...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 text-sm",
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs",
                  message.role === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : message.role === 'system'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                )}>
                  {message.agentName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {message.agentName}
                    </span>
                    {getActionIcon(message.actionType)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className={cn(
                    "px-3 py-2 rounded-lg",
                    message.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-950 text-gray-900 dark:text-gray-100'
                      : message.role === 'system'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-gray-900 dark:text-gray-100'
                  )}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
          Reconnecting to agent updates...
        </div>
      )}
    </div>
  );
}
