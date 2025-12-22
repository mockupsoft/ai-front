"use client";

import { useParams } from "next/navigation";
import { IssueDetail } from "@/components/mgx/issue-detail";

export default function IssueDetailPage() {
  const params = useParams();
  const linkId = params.repoId as string;
  const issueNumber = parseInt(params.issueNumber as string, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Issue #{issueNumber}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View issue details and comments
        </p>
      </div>

      <IssueDetail linkId={linkId} issueNumber={issueNumber} />
    </div>
  );
}


