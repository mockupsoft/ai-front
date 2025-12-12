# TEM Dashboard (MGX Shell)

This repo is a Next.js App Router project that includes an initial TEM dashboard shell under `app/mgx/`.

## Local development

```bash
npm install
npm run dev
```

Open:

- Landing page: http://localhost:3000
- Dashboard shell: http://localhost:3000/mgx

## MGX dashboard routes

- `/mgx` – overview
- `/mgx/tasks` – tasks table
- `/mgx/tasks/[id]` – task details
- `/mgx/metrics` – metrics (includes a placeholder chart)
- `/mgx/results` – results table

Each route includes basic loading/error states.

## Environment variables

### `NEXT_PUBLIC_MGX_API_BASE_URL`

Base URL (or base path) for the MGX REST client.

- Default: `/api/mgx` (uses built-in mock Next.js route handlers)
- Examples:
  - `NEXT_PUBLIC_MGX_API_BASE_URL=http://localhost:4000`
  - `NEXT_PUBLIC_MGX_API_BASE_URL=https://api.example.com`
  - `NEXT_PUBLIC_MGX_API_BASE_URL=/api/mgx`

The dashboard expects endpoints like:

- `GET /tasks`
- `GET /tasks/:id`
- `GET /metrics`
- `GET /results`

### `NEXT_PUBLIC_MGX_WS_URL`

WebSocket URL used by `useMgxWebSocket`.

- Default: `ws://localhost:4000/ws`

## Notes

- Reusable dashboard UI primitives live in `components/mgx/` (cards, tables, status pills).
- Shared data utilities live in `lib/mgx/` (REST client, SWR hooks, WebSocket hook).
