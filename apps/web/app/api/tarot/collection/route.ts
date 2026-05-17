import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/tarot/auth";
import { prisma } from "@/lib/tarot/prisma";

export const dynamic = "force-dynamic";

// 내 카드 컬렉션 조회 — 22장 전체 기준으로 수집/미수집 반환
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [collected, allCards] = await Promise.all([
    prisma.tarotCardCollection.findMany({
      where: { userId: auth.userId },
      include: {
        card: {
          select: {
            id: true,
            name: true,
            nameKo: true,
            number: true,
            keywords: true,
            keywordsKo: true,
            meaningUpright: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { firstDrawnAt: "asc" },
    }),
    prisma.tarotCard.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, nameKo: true, number: true },
      orderBy: { number: "asc" },
    }),
  ]);

  const collectedMap = new Map(collected.map((c) => [c.cardId, c]));

  const cards = allCards.map((card) => {
    const entry = collectedMap.get(card.id);
    return {
      id: card.id,
      name: card.name,
      nameKo: card.nameKo,
      number: card.number,
      collected: !!entry,
      firstDrawnAt: entry?.firstDrawnAt ?? null,
      drawCount: entry?.drawCount ?? 0,
    };
  });

  return NextResponse.json({
    total: allCards.length,
    collectedCount: collected.length,
    completionRate: allCards.length > 0 ? (collected.length / allCards.length) * 100 : 0,
    isComplete: collected.length === allCards.length,
    cards,
  });
}

// 카드 수집 기록 (뽑기 시 자동 호출) — upsert + drawCount 증가
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = (await req.json().catch(() => ({}))) as { cardIds?: string[] };
  const cardIds = body.cardIds ?? [];

  if (!cardIds.length) {
    return NextResponse.json({ error: "cardIds is required", code: "MISSING_FIELDS" }, { status: 400 });
  }

  const results: Array<{ cardId: string; isNew: boolean }> = [];

  for (const cardId of cardIds) {
    const existing = await prisma.tarotCardCollection.findUnique({
      where: { userId_cardId: { userId: auth.userId, cardId } },
    });

    if (existing) {
      await prisma.tarotCardCollection.update({
        where: { userId_cardId: { userId: auth.userId, cardId } },
        data: { drawCount: { increment: 1 } },
      });
      results.push({ cardId, isNew: false });
    } else {
      await prisma.tarotCardCollection.create({
        data: { userId: auth.userId, cardId },
      });
      results.push({ cardId, isNew: true });
    }
  }

  const newCards = results.filter((r) => r.isNew);
  return NextResponse.json({ results, newCardsUnlocked: newCards.length }, { status: 201 });
}
