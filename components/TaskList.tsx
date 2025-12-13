'use client';

import React from 'react';
import Link from 'next/link';
import { useTasks } from '@/lib/hooks';
import { useWebSocket as useWS } from '@/components/WebSocketProvider';
import { triggerRun } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskExecutionMonitor } from './TaskExecutionMonitor';
import { toast } from 'sonner';
import { Play, Plus } from 'lucide-react';

export function TaskList() {
    const { tasks, isLoading, mutate } = useTasks();
    const { lastMessage } = useWS();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeRun, setActiveRun] = React.useState<{ taskId: string; runId: string } | null>(null);

    React.useEffect(() => {
        if (lastMessage && ['run_progress', 'run_completed', 'run_failed', 'plan_ready'].includes(lastMessage.type)) {
            // Refresh list on status change
            mutate();
        }
    }, [lastMessage, mutate]);

    const handleTrigger = async (e: React.MouseEvent, taskId: string) => {
        e.preventDefault();
        try {
            const result = await triggerRun(taskId);
            toast.success('Run triggered successfully');
            if (result.runId) {
                setActiveRun({ taskId, runId: result.runId });
            }
            mutate();
        } catch {
            toast.error('Failed to trigger run');
        }
    };

    const handleTaskCreated = () => {
        mutate();
    };

    if (isLoading) return <div>Loading tasks...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Task
                </button>
            </div>

            {activeRun && (
                <div className="mb-6">
                    <TaskExecutionMonitor
                        taskId={activeRun.taskId}
                        runId={activeRun.runId}
                        onClose={() => setActiveRun(null)}
                        onStatusChange={() => mutate()}
                    />
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Run</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tasks?.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/mgx/tasks/${task.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                        {task.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => handleTrigger(e, task.id)}
                                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                        title="Trigger Run"
                                    >
                                        <Play className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    );
}
