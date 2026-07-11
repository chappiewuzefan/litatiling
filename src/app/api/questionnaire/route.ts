import { NextResponse } from "next/server";

import { ContactRateLimitError, enforceContactRateLimit, getRequestIpAddress } from "@/lib/contact-rate-limit";
import { getAdminFirestore, hasFirebaseAdminConfig } from "@/lib/firebase-admin";
import { validateQuestionnaire } from "@/lib/questionnaire";
import { createUploadToken, normalizeQuestionnaireAnswers, QUESTIONNAIRE_COLLECTION } from "@/lib/questionnaire-server";
import { hasPartialTurnstileConfig, hasTurnstileConfig, validateTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 1024 * 1024) return NextResponse.json({ message: "The questionnaire data is too large." }, { status: 413 });
    const body = await request.json() as { answers?: unknown; turnstileToken?: string };
    const answers = normalizeQuestionnaireAnswers(body.answers);
    if (answers.company) return NextResponse.json({ ok: true, id: "accepted", uploadToken: "accepted" });
    const validationErrors = validateQuestionnaire(answers);
    if (validationErrors.length) return NextResponse.json({ message: validationErrors[0], errors: validationErrors }, { status: 400 });
    if (!hasFirebaseAdminConfig()) return NextResponse.json({ message: "The project form storage is not configured. Please call LITA Tiling." }, { status: 503 });
    if (process.env.NODE_ENV === "production" && hasPartialTurnstileConfig()) return NextResponse.json({ message: "The security check is not fully configured." }, { status: 503 });
    const ipAddress = getRequestIpAddress(request);
    if (hasTurnstileConfig()) {
      const token = String(body.turnstileToken ?? "").slice(0, 4096);
      if (!token) return NextResponse.json({ message: "Please complete the security check." }, { status: 400 });
      const result = await validateTurnstileToken(token, ipAddress);
      if (!result.success) return NextResponse.json({ message: "Security verification failed. Please try again." }, { status: 400 });
    }
    await enforceContactRateLimit(ipAddress, "/api/questionnaire", process.env.FIREBASE_QUESTIONNAIRE_RATE_LIMIT_COLLECTION ?? "questionnaireRateLimits");
    const createdAt = new Date().toISOString();
    const upload = createUploadToken();
    const ref = getAdminFirestore().collection(QUESTIONNAIRE_COLLECTION).doc();
    await ref.set({ answers, attachments: [], status: "uploading", createdAt, updatedAt: createdAt, uploadTokenHash: upload.hash, uploadTokenExpiresAt: upload.expiresAt, sourceHost: request.headers.get("host") ?? "", userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "" });
    return NextResponse.json({ ok: true, id: ref.id, uploadToken: upload.token, expiresAt: upload.expiresAt });
  } catch (error) {
    if (error instanceof ContactRateLimitError) return NextResponse.json({ message: "Too many submissions. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } });
    console.error("Questionnaire creation failed:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not start the submission." }, { status: 500 });
  }
}
