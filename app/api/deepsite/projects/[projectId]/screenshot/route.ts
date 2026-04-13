import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/deepsite/server-backend";

/**
 * GET /api/deepsite/projects/{id}/screenshot
 * → FastAPI GET /api/deepsite/projects/{id}/screenshot (PNG, Playwright)
 *
 * Query: full_page, width, height, wait_ms (backend ile aynı)
 */

function forwardAuth(request: NextRequest): Record<string, string> {
  const h: Record<string, string> = {};
  const auth = request.headers.get("Authorization");
  if (auth) h["Authorization"] = auth;
  return h;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const BACKEND = getServerBackendUrl();
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const target = `${BACKEND}/api/deepsite/projects/${projectId}/screenshot${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: forwardAuth(request),
    });

    const buf = await res.arrayBuffer();

    if (!res.ok) {
      let msg = "";
      try {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const j = JSON.parse(new TextDecoder().decode(buf)) as { detail?: unknown };
          msg =
            typeof j.detail === "string"
              ? j.detail
              : JSON.stringify(j.detail ?? j);
        } else {
          msg = new TextDecoder().decode(buf).slice(0, 500);
        }
      } catch {
        msg = `HTTP ${res.status}`;
      }
      return NextResponse.json(
        { error: msg || `Screenshot failed (${res.status})` },
        { status: res.status }
      );
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backend unreachable" },
      { status: 502 }
    );
  }
}
