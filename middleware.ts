import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED = new Set(["en", "uk"]);

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const lang = nextUrl.searchParams.get("lang")?.toLowerCase();
  const response = NextResponse.next();

  if (lang && SUPPORTED.has(lang)) {
    response.cookies.set("ui-locale", lang, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
