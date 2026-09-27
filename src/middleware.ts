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
  const invoiceHost = hosts.includes("invoice.litatiling.com");
  if (invoiceHost || path === "/invoice" || path.startsWith("/invoice/") || path.startsWith("/api/invoice/")) {
    const url = request.nextUrl.clone();
    if (invoiceHost && path === "/") url.pathname = "/invoice";
    const response = invoiceHost && path === "/" ? NextResponse.rewrite(url) : NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  if (hosts.includes("quote.litatiling.com") && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/quote";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/invoice/:path*", "/api/invoice/:path*"] };
