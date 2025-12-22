"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { BranchesList } from "@/components/mgx/branches-list";
import { BranchCreateForm } from "@/components/mgx/branch-create-form";
import { BranchCompareView } from "@/components/mgx/branch-compare-view";

export default function BranchesPage() {
  const params = useParams();
  const linkId = params.repoId as string;
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Branches</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage GitHub branches for this repository
        </p>
      </div>

      <BranchCreateForm linkId={linkId} onSuccess={() => setRefreshKey((k) => k + 1)} />

      <BranchesList key={refreshKey} linkId={linkId} />

      <BranchCompareView linkId={linkId} />
    </div>
  );
}

