'use client';

import React from 'react';
import Link from 'next/link';
import { useTasks } from '@/lib/hooks';
import { useWebSocket as useWS } from '@/components/WebSocketProvider';
import { triggerRun } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { toast } from 'sonner';
import { Play } from 'lucide-react';

export function TaskList() {
    const { tasks, isLoading, mutate } = useTasks();
    const { lastMessage } = useWS();

    React.useEffect(() => {
        if (lastMessage && ['run_progress', 'run_completed', 'run_failed', 'plan_ready'].includes(lastMessage.type)) {
            // Refresh list on status change
            mutate();
        }
    }, [lastMessage, mutate]);

    const handleTrigger = async (e: React.MouseEvent, taskId: string) => {
        e.preventDefault();
        try {
            await triggerRun(taskId);
            toast.success('Run triggered successfully');
            mutate();
        } catch {
            toast.error('Failed to trigger run');
        }
    };

    if (isLoading) return <div>Loading tasks...</div>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Tasks</h1>
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
        </div>
    );
}
