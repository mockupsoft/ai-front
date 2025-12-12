"use client";

import { useEffect } from "react";

import { Button } from "@/components/mgx/ui/button";

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
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>
      </div>

      <Button variant="primary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
