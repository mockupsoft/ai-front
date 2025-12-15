import { redirect } from "next/navigation";

export default async function WorkflowBuilderRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/mgx/workflows/${id}/builder`);
}
