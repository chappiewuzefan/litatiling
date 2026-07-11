import { describe, expect, it } from "vitest";

import { NextRequest } from "next/server";

import { middleware } from "@/middleware";

describe("quote domain middleware", () => {
  it("rewrites the quote hostname root to the questionnaire", () => {
    const response = middleware(new NextRequest("https://quote.litatiling.com/"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://quote.litatiling.com/quote");
  });

  it("uses the forwarded hostname supplied by Firebase App Hosting", () => {
    const request = new NextRequest("https://internal-app-host/", {
      headers: { "x-forwarded-host": "quote.litatiling.com" },
    });
    const response = middleware(request);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://internal-app-host/quote");
  });

  it("does not rewrite the main production hostname", () => {
    const response = middleware(new NextRequest("https://www.litatiling.com/"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
