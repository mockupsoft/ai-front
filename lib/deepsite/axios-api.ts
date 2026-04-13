import axios from "axios";

/** Next.js /api routes (proxies to FastAPI where needed). */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Cache-Control": "no-store",
  },
});

api.interceptors.request.use((config) => config);
