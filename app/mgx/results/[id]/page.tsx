import { ResultDetailView } from "@/components/mgx/result-detail-view";

export default async function MgxResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <ResultDetailView resultId={id} />
    </div>
  );
}
