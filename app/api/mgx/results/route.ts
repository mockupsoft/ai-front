import { NextResponse } from "next/server";

import { mockResults } from "@/lib/mgx/mock-data";

export function GET() {
  return NextResponse.json(mockResults, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
