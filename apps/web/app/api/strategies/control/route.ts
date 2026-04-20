import type { NextRequest } from "next/server";

import { proxyGet } from "../../_utils";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  return proxyGet(search ? `/strategies/control?${search}` : "/strategies/control");
}
