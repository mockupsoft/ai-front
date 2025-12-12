'use client';

import React, { useState, useEffect } from 'react';
import { useTask, useRun } from '@/lib/hooks';
import { useWebSocket as useWS } from '@/components/WebSocketProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { Tabs } from '@/components/Tabs';
import { PlanViewer } from '@/components/PlanViewer';
import { ProgressFeed } from '@/components/ProgressFeed';
import { ResultsViewer } from '@/components/ResultsViewer';
import { approvePlan, triggerRun } from '@/lib/api';
import { toast } from 'sonner';
import { Play, CheckCircle } from 'lucide-react';

export function TaskDetail({ taskId }: { taskId: string }) {
  const { task, isLoading: taskLoading, mutate: mutateTask } = useTask(taskId);
  const { run, isLoading: runLoading, mutate: mutateRun } = useRun(taskId, task?.currentRunId);
  const { lastMessage } = useWS();
  const [activeTab, setActiveTab] = useState('plan');

  // Handle WS updates
  useEffect(() => {
    if (lastMessage) {
       // Ideally filter by task ID/Run ID if payload has it
       // For now, refresh all
       if (['plan_ready', 'run_progress', 'run_completed', 'run_failed'].includes(lastMessage.type)) {
           mutateTask();
           mutateRun();
       }
    }
  }, [lastMessage, mutateTask, mutateRun]);

  const handleTrigger = async () => {
      try {
          await triggerRun(taskId);
          toast.success('Run triggered');
          mutateTask();
      } catch (e) {
          toast.error('Failed to trigger run');
      }
  };

  const handleApprove = async () => {
      if (!task?.currentRunId) return;
      try {
          // Optimistic update?
          // We can just wait for the API call
          await approvePlan(taskId, task.currentRunId);
          toast.success('Plan approved');
          mutateTask();
          mutateRun();
      } catch (e) {
          toast.error('Failed to approve plan');
      }
  };

  if (taskLoading) return <div>Loading task...</div>;
  if (!task) return <div>Task not found</div>;

  const tabs = [
      { id: 'plan', label: 'Plan' },
      { id: 'progress', label: 'Progress' },
      { id: 'results', label: 'Results' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {task.name}
            <StatusBadge status={task.status} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
            {task.status !== 'running' && task.status !== 'waiting_approval' && (
                <button
                    onClick={handleTrigger}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Trigger Run
                </button>
            )}
            {task.status === 'waiting_approval' && (
                <button
                    onClick={handleApprove}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Plan
                </button>
            )}
        </div>
      </div>

      {run && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="mt-4">
                  {activeTab === 'plan' && (
                      <PlanViewer plan={run.plan} />
                  )}
                  {activeTab === 'progress' && (
                      <ProgressFeed logs={run.logs} />
                  )}
                  {activeTab === 'results' && (
                      <ResultsViewer artifacts={run.artifacts} taskId={taskId} runId={run.id} />
                  )}
              </div>
          </div>
      )}

      {!run && task.status !== 'pending' && (
          <div className="text-gray-500">No active run information available.</div>
      )}
    </div>
  );
}
