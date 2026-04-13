import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/deepsite/server-backend";

/**
 * /api/deepsite/projects/[projectId]/run — Next.js route handler
 *
 * POST  → FastAPI POST /api/deepsite/projects/{id}/run  (start container)
 * DELETE → FastAPI DELETE /api/deepsite/projects/{id}/run (stop container)
 * GET  → FastAPI GET /api/deepsite/projects/{id}/run/status
 */

function forwardAuth(request: NextRequest): Record<string, string> {
  const h: Record<string, string> = {};
  const auth = request.headers.get("Authorization");
  if (auth) h["Authorization"] = auth;
  return h;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const BACKEND = getServerBackendUrl();

  try {
    const res = await fetch(`${BACKEND}/api/deepsite/projects/${projectId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...forwardAuth(request),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Backend bağlantı hatası: ${err}` },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const BACKEND = getServerBackendUrl();

  try {
    const res = await fetch(`${BACKEND}/api/deepsite/projects/${projectId}/run`, {
      method: "DELETE",
      headers: { ...forwardAuth(request) },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const BACKEND = getServerBackendUrl();

  try {
    const res = await fetch(
      `${BACKEND}/api/deepsite/projects/${projectId}/run/status`,
      {
        method: "GET",
        headers: { ...forwardAuth(request) },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, running: false, error: String(err) },
      { status: 502 }
    );
  }
}
