"use client";

import { useEffect } from "react";

import { Button } from "@/components/mgx/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Result failed to load</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => reset()}>
          Retry
        </Button>
        <Link href="/mgx/results">
          <Button variant="secondary">
            Back to Results
          </Button>
        </Link>
      </div>
    </div>
  );
}
