import { buildResearchWorkspace } from "@trading/shared/src/research";
import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const workspace = buildResearchWorkspace(preferences);

  return NextResponse.json({
    cadence: workspace.newsletter.cadence,
    generatedAt: workspace.newsletter.generatedAt,
    nextRunAt: workspace.newsletter.nextRunAt,
    preferences: workspace.preferences,
    news: workspace.news,
    tickers: workspace.tickerAnalyses.map((analysis) => ({
      ticker: analysis.ticker,
      summary: analysis.summary,
      recommendation: analysis.recommendation
    })),
    envelope: workspace.newsletter
  });
}
