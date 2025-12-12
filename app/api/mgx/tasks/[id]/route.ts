import { NextResponse, type NextRequest } from "next/server";

import { getMockTask } from "@/lib/mgx/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getMockTask(id);

  if (!task) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(task, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
