"use client";

import { useParams } from "next/navigation";
import { ActivityFeed } from "@/components/mgx/activity-feed";

export default function ActivityPage() {
  const params = useParams();
  const linkId = params.repoId as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Activity Feed</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View recent GitHub activity for this repository
        </p>
      </div>

      <ActivityFeed linkId={linkId} limit={50} />
    </div>
  );
}


