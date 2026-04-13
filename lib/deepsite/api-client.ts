import { API_BASE_URL } from "./env";
import type {
  DeepSiteProject,
  TokenResponse,
  UserMe,
  DeepSitePage,
} from "./types";

const TOKEN_KEY = "deepsite_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(token: string | null, includeContentType = false): HeadersInit {
  const h: Record<string, string> = { "Accept": "application/json" };
  if (includeContentType) h["Content-Type"] = "application/json";
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text) as { detail?: unknown };
      detail =
        typeof j.detail === "string"
          ? j.detail
          : JSON.stringify(j.detail ?? text);
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
  fullName?: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: authHeaders(null, true),
    body: JSON.stringify({
      email,
      username,
      password,
      full_name: fullName || null,
    }),
  });
  return parseJson<TokenResponse>(res);
}

export async function loginUser(
  emailOrUsername: string,
  password: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: authHeaders(null, true),
    body: JSON.stringify({
      email_or_username: emailOrUsername,
      password,
    }),
  });
  return parseJson<TokenResponse>(res);
}

export async function fetchMe(token: string | null): Promise<UserMe> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: authHeaders(token),
  });
  return parseJson<UserMe>(res);
}

export async function listProjects(
  token: string | null
): Promise<DeepSiteProject[]> {
  const res = await fetch(`${API_BASE_URL}/api/deepsite/projects`, {
    headers: authHeaders(token),
  });
  return parseJson<DeepSiteProject[]>(res);
}

export async function createProject(
  token: string | null,
  name: string,
  description?: string
): Promise<DeepSiteProject> {
  const res = await fetch(`${API_BASE_URL}/api/deepsite/projects`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify({
      name,
      description: description ?? null,
      pages: [],
      files: [],
    }),
  });
  return parseJson<DeepSiteProject>(res);
}

export async function getProject(
  token: string | null,
  projectId: string
): Promise<DeepSiteProject> {
  const res = await fetch(
    `${API_BASE_URL}/api/deepsite/projects/${projectId}`,
    { headers: authHeaders(token) }
  );
  return parseJson<DeepSiteProject>(res);
}

export async function updateProject(
  token: string | null,
  projectId: string,
  body: Partial<{
    name: string;
    description: string | null;
    pages: DeepSitePage[];
    is_active: boolean;
    chat_history: { items: unknown[]; artifacts: unknown } | null;
  }>
): Promise<DeepSiteProject> {
  const res = await fetch(
    `${API_BASE_URL}/api/deepsite/projects/${projectId}`,
    {
      method: "PUT",
      headers: authHeaders(token, true),
      body: JSON.stringify(body),
    }
  );
  return parseJson<DeepSiteProject>(res);
}

export async function deleteProject(
  token: string | null,
  projectId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/deepsite/projects/${projectId}`,
    { method: "DELETE", headers: authHeaders(token) }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
}

export async function saveProject(
  token: string | null,
  projectId: string,
  pages: DeepSitePage[],
  commitTitle?: string
): Promise<DeepSiteProject> {
  const res = await fetch(
    `${API_BASE_URL}/api/deepsite/projects/${projectId}/save`,
    {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        pages,
        commit_title: commitTitle ?? "Manual save",
      }),
    }
  );
  return parseJson<DeepSiteProject>(res);
}

export async function autosaveProject(
  token: string | null,
  projectId: string,
  pages: DeepSitePage[]
): Promise<DeepSiteProject> {
  const res = await fetch(
    `${API_BASE_URL}/api/deepsite/projects/${projectId}/autosave`,
    {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify({ pages }),
    }
  );
  return parseJson<DeepSiteProject>(res);
}

export interface GenerateBody {
  prompt: string;
  context?: string | null;
  provider?: string | null;
  model?: string | null;
  temperature?: number;
  max_tokens?: number;
}

/** Stream SSE text chunks from /api/deepsite/generate */
export async function* streamGenerate(
  token: string | null,
  body: GenerateBody
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${API_BASE_URL}/api/deepsite/generate`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const data = JSON.parse(raw) as {
            text?: string;
            done?: boolean;
            error?: string;
          };
          if (data.error) throw new Error(data.error);
          if (data.done) return;
          if (data.text) yield data.text;
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
}
