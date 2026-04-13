"use client";

import { Save, GitCommit, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  projectName: string;
  onSave: () => void;
  onCommit: () => void;
  saving?: boolean;
};

export function EditorToolbar({
  projectName,
  onSave,
  onCommit,
  saving,
}: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/deepsite/projects"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Home className="h-4 w-4" />
          Projects
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {projectName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-1 rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
        >
          <Save className="h-4 w-4" />
          Autosave
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCommit}
          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <GitCommit className="h-4 w-4" />
          Save with commit
        </button>
      </div>
    </header>
  );
}
