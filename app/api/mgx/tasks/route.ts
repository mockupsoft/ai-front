import { NextResponse } from "next/server";

import { mockTasks } from "@/lib/mgx/mock-data";

export function GET() {
  return NextResponse.json(mockTasks, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
