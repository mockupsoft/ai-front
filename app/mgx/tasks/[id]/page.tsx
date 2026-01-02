import { TaskSplitView } from "@/components/mgx/task-split-view";

export default async function MgxTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskSplitView taskId={id} className="h-full w-full" />;
}
