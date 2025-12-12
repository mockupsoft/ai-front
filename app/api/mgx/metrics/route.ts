import { NextResponse } from "next/server";

import { mockMetrics } from "@/lib/mgx/mock-data";

export function GET() {
  return NextResponse.json(mockMetrics, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
