import type { NextRequest } from "next/server";

import { proxyPatch } from "../../_utils";

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  return proxyPatch("/strategies/execution", payload);
}
