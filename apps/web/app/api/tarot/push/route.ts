import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/tarot/prisma";
import { requireAuth } from "@/lib/tarot/auth";

export const dynamic = "force-dynamic";

// 푸시 토큰 등록/갱신
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = (await req.json().catch(() => ({}))) as { pushToken?: string };
  if (!body.pushToken) {
    return NextResponse.json({ error: "pushToken is required", code: "MISSING_FIELDS" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { pushToken: body.pushToken },
    select: { id: true, pushToken: true },
  });

  return NextResponse.json(user);
}

// 알림 발송 (수동 트리거용 — 향후 cron으로 전환)
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { pushToken: true },
  });

  return NextResponse.json({ hasPushToken: !!user?.pushToken });
}
