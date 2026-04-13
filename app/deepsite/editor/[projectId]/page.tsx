/**
 * Next.js Server Component — proje verisini ve live URL'yi sunucu tarafında fetch eder.
 * Bu yaklaşım useEffect/hydration sorunlarını tamamen ortadan kaldırır.
 */
import { cache } from "react";
import { EditorClient } from "./editor-client";

/** Editör her zaman taze veriyle üretilsin; eski RSC/ISR önbelleği yeni UI’yi gizlemesin */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

/** Server-side API çağrısı — auth token gerekmez (SKIP_AUTH=true) */
async function fetchProject(projectId: string) {
  try {
    const res = await fetch(
      `${process.env.INTERNAL_API_BASE_URL ?? BACKEND_URL}/api/deepsite/projects/${projectId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Server-side container başlatma — live preview URL döner. React cache ile bir kez çağrılır. */
const runProjectServer = cache(async function runProjectServer(projectId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.INTERNAL_API_BASE_URL ?? BACKEND_URL}/api/deepsite/projects/${projectId}/run`,
      { method: "POST", cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ok || !data.url) return null;
    return data.url as string;
  } catch {
    return null;
  }
});

/** Server-side proje yükle — React cache ile bir kez çağrılır */
const fetchProjectCached = cache(fetchProject);

export default async function DeepSiteEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Server-side proje yükle (React cache ile deduplicate edildi)
  const project = await fetchProjectCached(projectId);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Proje bulunamadı.</p>
      </div>
    );
  }

  // Non-HTML stack projesi ise server-side container başlat
  const html =
    project.pages?.find((x: { path: string }) => x.path === "/")?.html ||
    project.pages?.[0]?.html ||
    "";

  let initialLiveUrl: string | null = null;
  if (html.includes('data-deepsite-preview="project-files"')) {
    initialLiveUrl = await runProjectServer(projectId);
  }

  return (
    <EditorClient
      projectId={projectId}
      projectData={project}
      initialHtml={html}
      initialLiveUrl={initialLiveUrl}
    />
  );
}
