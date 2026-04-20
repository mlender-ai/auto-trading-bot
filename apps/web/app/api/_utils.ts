import { NextResponse } from "next/server";

import { backendApiFetch } from "../../lib/backend-api";

export async function proxyGet<T>(path: string) {
  try {
    const data = await backendApiFetch<T>(path);
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

export async function proxyPatch<T>(path: string, payload: unknown) {
  try {
    const data = await backendApiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Proxy PATCH failed"
      },
      {
        status: 500
      }
    );
  }
}
