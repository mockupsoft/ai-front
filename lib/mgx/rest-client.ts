import { MGX_API_BASE_URL } from "@/lib/mgx/env";

export type RestClientOptions = {
  baseUrl?: string;
  fetcher?: typeof fetch;
  defaultHeaders?: HeadersInit;
};

function joinPath(basePath: string, path: string) {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function resolveUrl(baseUrl: string, path: string) {
  if (!baseUrl) return path;

  if (baseUrl.startsWith("/")) {
    return joinPath(baseUrl, path);
  }

  return new URL(path, baseUrl).toString();
}

export class MgxApiError extends Error {
  status: number;
  url: string;

  constructor(message: string, opts: { status: number; url: string }) {
    super(message);
    this.name = "MgxApiError";
    this.status = opts.status;
    this.url = opts.url;
  }
}

export function createRestClient(options: RestClientOptions = {}) {
  const baseUrl = options.baseUrl ?? MGX_API_BASE_URL;
  const fetcher = options.fetcher ?? fetch;
  const defaultHeaders = options.defaultHeaders;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = resolveUrl(baseUrl, path);

    const res = await fetcher(url, {
      ...init,
      headers: {
        ...defaultHeaders,
        ...init?.headers,
      },
    });

    if (!res.ok) {
      throw new MgxApiError(`MGX API request failed: ${res.status} ${res.statusText}`, {
        status: res.status,
        url,
      });
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return (await res.text()) as T;
  }

  return {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "GET" }),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...init?.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}

export const mgxRestClient = createRestClient();
