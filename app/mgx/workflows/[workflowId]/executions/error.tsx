"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/mgx/ui/button";

export default function ExecutionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6 rounded-lg border border-rose-200 bg-rose-50 p-8 dark:border-rose-900 dark:bg-rose-950">
      <div>
        <h2 className="font-semibold text-rose-900 dark:text-rose-50">
          Failed to load executions
        </h2>
        <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}
