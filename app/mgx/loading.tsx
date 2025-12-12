import { Spinner } from "@/components/mgx/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center gap-3">
      <Spinner />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
    </div>
  );
}
