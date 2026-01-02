export const MGX_API_BASE_URL =
  process.env.NEXT_PUBLIC_MGX_API_BASE_URL ?? "/api/mgx";

export const MGX_WS_URL =
  process.env.NEXT_PUBLIC_MGX_WS_URL ?? 
  process.env.NEXT_PUBLIC_WS_URL ?? 
  "ws://localhost:8000/ws/stream";

export const MGX_AGENT_WS_URL =
  process.env.NEXT_PUBLIC_MGX_AGENT_WS_URL ?? `${MGX_WS_URL}/agents/stream`;
