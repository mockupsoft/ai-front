/** Backend FastAPI base URL (browser must reach host, not container-only names). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/**
 * Skip login for DeepSite (projects + editor).
 * - `NEXT_PUBLIC_DEEPSITE_SKIP_AUTH=false` → always require login
 * - `NEXT_PUBLIC_DEEPSITE_SKIP_AUTH=true` → skip login
 * - unset → skip in `next dev` (NODE_ENV=development), require login in production builds
 */
const explicit = process.env.NEXT_PUBLIC_DEEPSITE_SKIP_AUTH;
export const DEEPSITE_SKIP_AUTH =
  explicit === "false"
    ? false
    : explicit === "true" || process.env.NODE_ENV === "development";
