'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/components/WebSocketProvider';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { getTaskRun, saveTaskRun } from '@/lib/storage';
import type { TaskRun, TaskStatus } from '@/lib/types';
import { AgentChat } from './AgentChat';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface TaskExecutionMonitorProps {
  taskId: string;
  runId: string;
  onClose?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
}

export function TaskExecutionMonitor({
  taskId,
  runId,
  onClose,
  onStatusChange,
}: TaskExecutionMonitorProps) {
  const [run, setRun] = useState<TaskRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { lastMessage } = useWebSocket();
  const { startBackgroundTask, updateTaskStatus } = useServiceWorker();

  useEffect(() => {
    const loadRun = async () => {
      try {
        const storedRun = await getTaskRun(runId);
        if (storedRun) {
          setRun(storedRun);
        } else {
          const newRun: TaskRun = {
            taskId,
            runId,
            startedAt: Date.now(),
            messages: [],
            status: 'running',
          };
          await saveTaskRun(newRun);
          setRun(newRun);
        }
      } catch (error) {
        console.error('Failed to load run:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRun();

    // Register with service worker to track background task
    startBackgroundTask(taskId, runId);
  }, [taskId, runId, startBackgroundTask]);

  useEffect(() => {
    if (!lastMessage || !run) return;

    if (lastMessage.type === 'run_completed' || lastMessage.type === 'run_failed') {
      const payload = lastMessage.payload as Partial<TaskRun>;
      if (payload.taskId === taskId && payload.runId === runId) {
        const status = lastMessage.type === 'run_completed' ? 'completed' : 'failed';
        const updatedRun = { ...run, status: status as TaskStatus };
        setRun(updatedRun);
        saveTaskRun(updatedRun).catch(console.error);
        updateTaskStatus(taskId, runId, status);
        onStatusChange?.(status as TaskStatus);
      }
    }
  }, [lastMessage, run, taskId, runId, onStatusChange, updateTaskStatus]);

  const getStatusDisplay = () => {
    if (!run) return null;

    switch (run.status) {
      case 'running':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-blue-500" />,
          text: 'Task is running...',
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Task completed successfully',
          color: 'text-green-600 dark:text-green-400',
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: 'Task failed',
          color: 'text-red-600 dark:text-red-400',
        };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status && (
            <>
              {status.icon}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Task Execution
                </h3>
                <p className={`text-sm ${status.color}`}>{status.text}</p>
              </div>
            </>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="h-96">
            <AgentChat
              taskId={taskId}
              runId={runId}
              isRunning={run?.status === 'running'}
            />
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Task: {taskId} • Run: {runId}
          </span>
          <span>
            Started: {run ? new Date(run.startedAt).toLocaleTimeString() : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
