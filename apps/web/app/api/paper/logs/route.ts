import { backendApiFetch } from "../../../../lib/backend-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit") ?? "60";

  try {
    const data = await backendApiFetch(`/paper/logs?limit=${limit}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Proxy GET failed"
      },
      {
        status: 500
      }
    );
  }
}
