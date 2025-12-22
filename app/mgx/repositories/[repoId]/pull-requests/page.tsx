"use client";

import { useParams } from "next/navigation";
import { PullRequestList } from "@/components/mgx/pull-request-list";

export default function PullRequestsPage() {
  const params = useParams();
  const linkId = params.repoId as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pull Requests</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage GitHub pull requests for this repository
        </p>
      </div>

      <PullRequestList linkId={linkId} state="open" />
    </div>
  );
}


