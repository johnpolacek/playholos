import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, admits } from "@/lib/access";

export function proxy(request: NextRequest) {
  if (admits(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) return Response.json({ error: "Locked." }, { status: 401 });
  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(unlock);
}

// Everything but the unlock page and Next's own static files.
export const config = {
  matcher: ["/((?!unlock|_next/static|_next/image|favicon.ico).*)"],
};
