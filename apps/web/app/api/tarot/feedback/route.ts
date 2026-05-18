import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/tarot/prisma";
import { requireAuth } from "@/lib/tarot/auth";

type FeedbackRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";

const RATING_MAP: Record<1 | 2 | 3 | 4 | 5, FeedbackRating> = {
  1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE",
};

function toRating(n: number): FeedbackRating | null {
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return RATING_MAP[n];
  return null;
}

function errorJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await req.json().catch(() => ({})) as {
    drawId?: string;
    rating?: number;
    comment?: string;
  };

  const { drawId, rating, comment } = body;

  if (!drawId) return errorJson("drawId is required", "MISSING_DRAW_ID", 400);
  const ratingEnum = rating != null ? toRating(rating) : null;
  if (!ratingEnum) return errorJson("rating must be 1-5", "INVALID_RATING", 400);

  const draw = await prisma.tarotDrawHistory.findFirst({ where: { id: drawId, userId } });
  if (!draw) return errorJson("Draw not found", "NOT_FOUND", 404);

  const commentVal = comment ?? null;
  const feedback = await prisma.tarotFeedback.upsert({
    where: { userId_drawId: { userId, drawId } },
    create: { userId, drawId, rating: ratingEnum, comment: commentVal },
    update: { rating: ratingEnum, comment: commentVal },
  });

  return NextResponse.json({ id: feedback.id });
}
