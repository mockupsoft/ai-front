"use client";

import { useParams } from "next/navigation";
import { PullRequestDetail } from "@/components/mgx/pull-request-detail";

export default function PullRequestDetailPage() {
  const params = useParams();
  const linkId = params.repoId as string;
  const prNumber = parseInt(params.prNumber as string, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pull Request #{prNumber}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View pull request details, reviews, and comments
        </p>
      </div>

      <PullRequestDetail linkId={linkId} prNumber={prNumber} />
    </div>
  );
}


