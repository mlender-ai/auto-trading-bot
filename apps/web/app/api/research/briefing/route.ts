import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";
import { readPreferredResearchSnapshot, runAndPersistResearchPipeline } from "../../../../lib/researchPipelineStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const snapshot = (await readPreferredResearchSnapshot(preferences)) ?? (await runAndPersistResearchPipeline(preferences, "web-api"));
  const briefing = snapshot.workspace;

  return NextResponse.json(briefing);
}
