/**
 * FastAPI tabanı — yalnızca Next.js sunucu tarafında (Route Handlers, Server Components).
 * Tarayıcı `NEXT_PUBLIC_*` ile host makineye gider; Docker'daki `mgx-frontend` konteynerinde
 * `localhost:8000` yanlış hedeftir — `INTERNAL_API_BASE_URL=http://mgx-ai:8000` kullanın.
 */
export function getServerBackendUrl(): string {
  return (
    process.env.INTERNAL_API_BASE_URL ??
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  );
}
