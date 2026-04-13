import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/deepsite/server-backend";

/**
 * /api/deepsite/ask-ai — Next.js route handler
 *
 * POST → FastAPI POST /api/deepsite/generate (SSE stream) proxy'si.
 *
 * Backend iki farklı format üretebilir:
 *   (A) NDJSON event stream (agent mode):
 *       data: {"text":"{\"type\":\"agent_start\",...}\n"}\n\n
 *       data: {"text":"__HTML_START__\n"}\n\n
 *       data: {"text":"<!DOCTYPE html>..."}\n\n
 *
 *   (B) Ham text stream (direct mode, eski format):
 *       data: {"text":"<think>...</think>\n"}\n\n
 *       data: {"text":"<!DOCTYPE html>..."}\n\n
 *
 * Bu route her iki formatı da aşağıdaki kurala göre frontend'e iletir:
 *   - SSE `data:` satırları açılır, `text` içeriği ham olarak gönderilir.
 *   - İçerik tipine bakılmaz — frontend kendi parser'ı ile ayırt eder.
 *   - Satır bütünlüğü korunur (NDJSON parsing için kritik).
 *
 * PUT → FastAPI PUT /api/deepsite/follow-up (JSON, non-streaming).
 */

function forwardAuthHeader(request: NextRequest): Record<string, string> {
  const h: Record<string, string> = {};
  const auth = request.headers.get("Authorization");
  if (auth) h["Authorization"] = auth;
  return h;
}

export async function POST(request: NextRequest) {
  const BACKEND = getServerBackendUrl();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const backendBody: Record<string, unknown> = {
    prompt: body.prompt,
    context: body.html ?? body.context ?? null,
    provider: body.provider ?? null,
    model: body.model ?? null,
    mode: body.mode ?? "agent",
    stack_type: body.stackType ?? body.stack_type ?? null,
    prompt_history: body.promptHistory ?? body.prompt_history ?? null,
    project_id: body.projectId ?? body.project_id ?? null,
    existing_files: body.existingFiles ?? body.existing_files ?? null,
  };

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND}/api/deepsite/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...forwardAuthHeader(request),
      },
      body: JSON.stringify(backendBody),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!backendRes.ok || !backendRes.body) {
    let errText = "";
    try { errText = await backendRes.text(); } catch { /* ignore */ }
    return NextResponse.json(
      { error: errText || `Backend error ${backendRes.status}` },
      { status: backendRes.status }
    );
  }

  /**
   * SSE → raw text dönüşümü.
   *
   * Backend'in FastAPI endpoint'i `text/event-stream` formatında:
   *   data: {"text":"..."}\n\n
   * satırları gönderir. Bu route her SSE satırından `text` alanını çıkarır
   * ve ham string olarak aktarır. Satır bütünlüğü korunur; \n ile biter.
   *
   * NDJSON event satırları ve __HTML_START__ sentinel arasındaki ayrım
   * frontend'in `processChunk()` fonksiyonuna bırakılır.
   */
  const backendReader = backendRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  void (async () => {
    let sseBuffer = "";
    try {
      while (true) {
        const { done, value } = await backendReader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        // SSE satırları \n\n ile ayrılır; her \n'den split yap
        const lines = sseBuffer.split("\n");
        // Son satır tamamlanmamış olabilir — beklet
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw) as {
              text?: string;
              done?: boolean;
              error?: string;
            };

            if (parsed.error) {
              // Hata durumunda NDJSON error event yaz
              const errEvent = JSON.stringify({ type: "error", agent: "System", message: parsed.error }) + "\n";
              await writer.write(encoder.encode(errEvent));
              return;
            }

            if (parsed.done) {
              // done signal — stream doğal bitiyor
              return;
            }

            if (typeof parsed.text === "string" && parsed.text.length > 0) {
              // Ham text'i doğrudan frontend'e gönder.
              // İçinde NDJSON satırları, __HTML_START__ ya da ham HTML olabilir.
              await writer.write(encoder.encode(parsed.text));
            }
          } catch {
            // Malformed SSE satırı — yok say
          }
        }
      }
    } finally {
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    },
  });
}

export async function PUT(request: NextRequest) {
  const BACKEND = getServerBackendUrl();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND}/api/deepsite/follow-up`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...forwardAuthHeader(request),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ ok: false, message: msg }, { status: 502 });
  }

  let json: unknown;
  try {
    json = await backendRes.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: `Backend error ${backendRes.status}` },
      { status: backendRes.status }
    );
  }

  return NextResponse.json(json, { status: backendRes.status });
}
