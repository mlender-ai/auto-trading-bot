import { buildResearchWorkspace } from "@trading/shared/src/research";
import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const briefing = buildResearchWorkspace(preferences);

  return NextResponse.json(briefing);
}
