import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const dashboardPassword = process.env.DASHBOARD_PASSWORD;
  const localDemoMode = process.env.LOCAL_DEMO_MODE === "true";

  if (localDemoMode) {
    return NextResponse.next();
  }

  if (!dashboardPassword) {
    return NextResponse.next();
  }

  const session = request.cookies.get("dashboard_session")?.value;

  if (session === dashboardPassword) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api).*)"]
};
