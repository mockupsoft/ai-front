import { NextResponse } from "next/server";

import { mockResults } from "@/lib/mgx/mock-data";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return (async () => {
    const { id } = await params;
    const result = mockResults.find((r) => r.id === id);

    if (!result) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store",
      },
    });
  })();
}
