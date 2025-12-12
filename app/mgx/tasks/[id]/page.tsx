import { TaskDetail } from "@/components/TaskDetail";

export default async function MgxTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail taskId={id} />;
}
