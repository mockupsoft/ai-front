import { Spinner } from "@/components/mgx/ui/spinner";

export default function ExecutionsLoading() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <Spinner className="h-5 w-5" />
      <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
        Loading executions…
      </span>
    </div>
  );
}
