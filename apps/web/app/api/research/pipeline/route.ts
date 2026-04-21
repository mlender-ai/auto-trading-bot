import { NextRequest, NextResponse } from "next/server";

import { parseResearchPreferences } from "../../../../lib/research";
import { readPreferredResearchSnapshot, runAndPersistResearchPipeline } from "../../../../lib/researchPipelineStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const preferences = parseResearchPreferences(request.nextUrl.searchParams);
  const snapshot = await readPreferredResearchSnapshot(preferences);

  if (snapshot) {
    const response = NextResponse.json(snapshot);
    response.headers.set("x-research-contract-version", snapshot.contractVersion);
    return response;
  }

  const generated = await runAndPersistResearchPipeline(preferences, "web-api");
  const response = NextResponse.json(generated);
  response.headers.set("x-research-contract-version", generated.contractVersion);
  return response;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as { preferences?: ReturnType<typeof parseResearchPreferences> };
  const snapshot = await runAndPersistResearchPipeline(payload.preferences, "web-api");
  const response = NextResponse.json(snapshot);
  response.headers.set("x-research-contract-version", snapshot.contractVersion);
  return response;
}
