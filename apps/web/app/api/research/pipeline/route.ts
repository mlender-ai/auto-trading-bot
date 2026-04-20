import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";
import { readStoredResearchSnapshot, runAndPersistResearchPipeline } from "../../../../lib/researchPipelineStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const snapshot = await readStoredResearchSnapshot();
  const hasRequestedPreferences = Boolean(preferences.sectors?.length || preferences.tickers?.length);
  const matchesStoredPreferences =
    snapshot &&
    snapshot.workspace.preferences.sectors.join(",") === (preferences.sectors ?? []).join(",") &&
    snapshot.workspace.preferences.tickers.join(",") === (preferences.tickers ?? []).join(",");

  if (snapshot && (!hasRequestedPreferences || matchesStoredPreferences)) {
    return NextResponse.json(snapshot);
  }

  const generated = await runAndPersistResearchPipeline(preferences, "web-api");
  return NextResponse.json(generated);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as { preferences?: ReturnType<typeof parseResearchPreferences> };
  const snapshot = await runAndPersistResearchPipeline(payload.preferences, "web-api");

  return NextResponse.json(snapshot);
}
