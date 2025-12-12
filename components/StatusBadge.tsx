import clsx from 'clsx';
import { TaskStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: TaskStatus | undefined }) {
    if (!status) return null;

    const colors = {
        pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        waiting_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium", colors[status] || colors.pending)}>
            {status.replace('_', ' ').toUpperCase()}
        </span>
    );
}
