import { createHash } from "node:crypto";

import { getAdminFirestore } from "@/lib/firebase-admin";

const DEFAULT_MAX_REQUESTS = 3;
const DEFAULT_WINDOW_SECONDS = 600;

export class ContactRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Contact form rate limit exceeded.");
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function getRateLimitMaxRequests() {
  const parsed = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? "3");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_REQUESTS;
}

function getRateLimitWindowSeconds() {
  const parsed = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "600");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WINDOW_SECONDS;
}

function getRateLimitCollection() {
  return process.env.FIREBASE_RATE_LIMIT_COLLECTION ?? "contactRateLimits";
}

function hashIpAddress(ipAddress: string) {
  return createHash("sha256").update(ipAddress).digest("hex").slice(0, 32);
}

export function getRequestIpAddress(request: Request) {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

export async function enforceContactRateLimit(ipAddress: string | null) {
  if (!ipAddress) {
    return;
  }

  const maxRequests = getRateLimitMaxRequests();
  const windowSeconds = getRateLimitWindowSeconds();
  const windowMs = windowSeconds * 1000;
  const nowMs = Date.now();
  const windowStartedAtMs = Math.floor(nowMs / windowMs) * windowMs;
  const windowEndsAtMs = windowStartedAtMs + windowMs;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowEndsAtMs - nowMs) / 1000),
  );
  const ipHash = hashIpAddress(ipAddress);
  const docId = `${ipHash}:${windowStartedAtMs}`;
  const db = getAdminFirestore();
  const docRef = db.collection(getRateLimitCollection()).doc(docId);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const currentCount =
      snapshot.exists &&
      typeof snapshot.data()?.count === "number" &&
      Number.isFinite(snapshot.data()?.count)
        ? snapshot.data()!.count
        : 0;

    if (currentCount >= maxRequests) {
      throw new ContactRateLimitError(retryAfterSeconds);
    }

    transaction.set(
      docRef,
      {
        route: "/api/contact",
        ipHash,
        count: currentCount + 1,
        windowStartedAt: new Date(windowStartedAtMs).toISOString(),
        windowEndsAt: new Date(windowEndsAtMs).toISOString(),
        updatedAt: new Date(nowMs).toISOString(),
      },
      { merge: true },
    );
  });
}
