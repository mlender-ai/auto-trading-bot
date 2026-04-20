import type { NextRequest } from "next/server";

import { proxyPatch } from "../../../_utils";

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  return proxyPatch(`/strategies/${params.id}/toggle`, {});
}
