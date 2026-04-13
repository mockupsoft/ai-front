import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Fetch page as markdown via Jina Reader (same as deepsite-locally). */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { url } = body as { url?: string };

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      method: "POST",
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch redesign" }, { status: 500 });
    }
    const markdown = await response.text();
    return NextResponse.json({ ok: true, markdown }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
