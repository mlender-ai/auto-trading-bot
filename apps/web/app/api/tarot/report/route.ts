import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/tarot/prisma";
import { requireAuth } from "@/lib/tarot/auth";

function errorJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await req.json().catch(() => ({})) as {
    drawId?: string;
    reason?: string;
  };

  const { drawId, reason } = body;

  if (!drawId) return errorJson("drawId is required", "MISSING_DRAW_ID", 400);
  if (!reason || reason.trim().length < 2) return errorJson("reason is required", "MISSING_REASON", 400);

  const draw = await prisma.tarotDrawHistory.findFirst({ where: { id: drawId, userId } });
  if (!draw) return errorJson("Draw not found", "NOT_FOUND", 404);

  const report = await prisma.tarotReport.create({
    data: { userId, drawId, reason: reason.trim() },
  });

  return NextResponse.json({ id: report.id });
}
