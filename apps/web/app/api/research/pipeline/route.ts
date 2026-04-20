import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";
import { readPreferredResearchSnapshot, runAndPersistResearchPipeline } from "../../../../lib/researchPipelineStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const snapshot = await readPreferredResearchSnapshot(preferences);

  if (snapshot) {
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
