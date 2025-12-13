import { TaskMonitoringView } from "@/components/mgx/task-monitoring-view";

export default async function MgxTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskMonitoringView taskId={id} />;
}
