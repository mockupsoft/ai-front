"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { IssuesList } from "@/components/mgx/issues-list";
import { IssueCreateForm } from "@/components/mgx/issue-create-form";

export default function IssuesPage() {
  const params = useParams();
  const linkId = params.repoId as string;
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Issues</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage GitHub issues for this repository
        </p>
      </div>

      <IssueCreateForm linkId={linkId} onSuccess={() => setRefreshKey((k) => k + 1)} />

      <IssuesList key={refreshKey} linkId={linkId} state="open" />
    </div>
  );
}

