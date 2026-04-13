"use client";

import Link from "next/link";
import type { DeepSiteProject } from "@/lib/deepsite/types";
import { FileCode2 } from "lucide-react";

type Props = {
  project: DeepSiteProject;
};

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/deepsite/editor/${project.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-violet-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          <FileCode2 className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            {new Date(project.updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
