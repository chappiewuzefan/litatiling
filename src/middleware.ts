import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hosts = [
    request.headers.get("host"),
    request.headers.get("x-forwarded-host"),
    request.headers.get("x-original-host"),
    request.nextUrl.hostname,
  ]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim().split(":")[0]?.toLowerCase())
    .filter(Boolean);
  const path = request.nextUrl.pathname;
  if (hosts.includes("quote.litatiling.com") && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/quote";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
