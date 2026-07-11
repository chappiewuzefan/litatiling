import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const path = request.nextUrl.pathname;
  if (host === "quote.litatiling.com" && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/quote";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
