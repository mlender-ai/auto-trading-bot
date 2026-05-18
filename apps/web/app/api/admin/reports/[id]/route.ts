import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

const VALID_STATUSES = ["REVIEWED", "RESOLVED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return NextResponse.json(
        { error: "status must be REVIEWED or RESOLVED", code: "INVALID_STATUS" },
        { status: 400 }
      );
    }

    const report = await prisma.tarotReport.update({
      where: { id: params.id },
      data: { status: status as typeof VALID_STATUSES[number] },
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }
}
