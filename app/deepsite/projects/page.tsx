"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useDeepSiteAuth } from "@/lib/deepsite/auth-context";
import { DEEPSITE_SKIP_AUTH } from "@/lib/deepsite/env";
import { listProjects, createProject } from "@/lib/deepsite/api-client";
import { ProjectCard } from "@/components/deepsite/ProjectCard";
import type { DeepSiteProject } from "@/lib/deepsite/types";
import { toast } from "sonner";

export default function DeepSiteProjectsPage() {
  const router = useRouter();
  const { token, user, loading, logout } = useDeepSiteAuth();
  const [projects, setProjects] = useState<DeepSiteProject[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchProjects = (tok: string | null) => {
    setFetching(true);
    setLoadError(false);
    listProjects(tok)
      .then((list) => setProjects(list))
      .catch(() => setLoadError(true))
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    // In skip-auth mode, don't wait for auth loading — fetch projects immediately
    if (!DEEPSITE_SKIP_AUTH && loading) return;
    if (!DEEPSITE_SKIP_AUTH && !token) {
      router.replace("/deepsite/login");
      return;
    }
    fetchProjects(DEEPSITE_SKIP_AUTH ? null : token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading]);

  async function handleNew() {
    if (!DEEPSITE_SKIP_AUTH && !token) return;
    setCreating(true);
    try {
      const p = await createProject(
        DEEPSITE_SKIP_AUTH ? null : token,
        `Project ${new Date().toLocaleString()}`,
        ""
      );
      toast.success("Project created");
      router.push(`/deepsite/editor/${p.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  if ((loading && !DEEPSITE_SKIP_AUTH) || (!DEEPSITE_SKIP_AUTH && !token && fetching)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!DEEPSITE_SKIP_AUTH && !token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">DeepSite</h1>
          <p className="text-sm text-zinc-500">
            {DEEPSITE_SKIP_AUTH ? (
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Local mode (no login)</span>
            ) : (
              <>
                Signed in as{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{user?.username}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleNew}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New project
          </button>
          <Link
            href="/mgx"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            MGX Dashboard
          </Link>
          {!DEEPSITE_SKIP_AUTH && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/deepsite/login");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Log out
            </button>
          )}
        </div>
      </div>

      {fetching ? (
        <p className="text-zinc-500">Loading projects…</p>
      ) : loadError ? (
        <div className="rounded-xl border border-dashed border-red-300 p-12 text-center dark:border-red-700">
          <p className="text-red-600 dark:text-red-400">Failed to load projects.</p>
          <button
            type="button"
            onClick={() => fetchProjects(DEEPSITE_SKIP_AUTH ? null : token)}
            className="mt-4 text-violet-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-600">
          <p className="text-zinc-600 dark:text-zinc-400">No projects yet.</p>
          <button
            type="button"
            onClick={handleNew}
            className="mt-4 text-violet-600 hover:underline"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
