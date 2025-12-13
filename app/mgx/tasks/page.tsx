import { TaskList } from "@/components/TaskList";

export default function MgxTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage all system tasks.
        </p>
      </div>
      <TaskList />
    </div>
  );
}
