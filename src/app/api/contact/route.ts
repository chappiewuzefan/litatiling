import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

import {
  ContactRateLimitError,
  enforceContactRateLimit,
  getRequestIpAddress,
} from "@/lib/contact-rate-limit";
import { getAdminFirestore, hasFirebaseAdminConfig } from "@/lib/firebase-admin";
import { sendLeadNotification } from "@/lib/lead-notifications";
import { buildPhoneCandidates, normalizePhoneForKey } from "@/lib/phone";
import { siteConfig } from "@/lib/site-config";
import {
  hasPartialTurnstileConfig,
  hasTurnstileConfig,
  validateTurnstileToken,
} from "@/lib/turnstile";

type ContactPayload = {
  name?: string;
  phone?: string;
  email?: string;
  suburb?: string;
  serviceType?: string;
  projectType?: string;
  preferredLanguage?: string;
  message?: string;
  sourcePage?: string;
  company?: string;
  turnstileToken?: string;
};

function normalizeField(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getPreferredLocale(body: ContactPayload) {
  const preferredLanguage = normalizeField(body.preferredLanguage, 10).toLowerCase();
  if (preferredLanguage === "zh") {
    return "zh";
  }

  return getStringValue(body.sourcePage).startsWith("/zh") ? "zh" : "en";
}

function getLocalizedMessage(locale: "en" | "zh", en: string, zh: string) {
  return locale === "zh" ? zh : en;
}

async function findExistingLeadDocs(
  phoneNormalized: string,
  phoneCandidates: string[],
) {
  const db = getAdminFirestore();
  const collection = db.collection(siteConfig.firebaseCollection);
  const matches = new Map<string, QueryDocumentSnapshot>();

  const normalizedSnapshot = await collection
    .where("phoneNormalized", "==", phoneNormalized)
    .get();

  normalizedSnapshot.docs.forEach((doc) => {
    matches.set(doc.id, doc);
  });

  if (phoneCandidates.length > 0) {
    const phoneSnapshot = await collection
      .where("phone", "in", phoneCandidates)
      .get();

    phoneSnapshot.docs.forEach((doc) => {
      matches.set(doc.id, doc);
    });
  }

  return Array.from(matches.values());
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (normalizeField(body.company, 128)) {
    return NextResponse.json({ ok: true });
  }

  const locale = getPreferredLocale(body);

  const lead = {
    name: normalizeField(body.name, 120),
    phone: normalizeField(body.phone, 80),
    email: normalizeField(body.email, 160).toLowerCase(),
    suburb: normalizeField(body.suburb, 120),
    serviceType: normalizeField(body.serviceType, 80),
    projectType: normalizeField(body.projectType, 80),
    preferredLanguage: normalizeField(body.preferredLanguage, 10) || "en",
    message: normalizeField(body.message, 5000),
    sourcePage: normalizeField(body.sourcePage, 120) || "/",
    createdAt: new Date().toISOString(),
  };
  const phoneNormalized = normalizePhoneForKey(lead.phone);

  if (
    !lead.name ||
    !lead.phone ||
    !lead.email ||
    !lead.suburb ||
    !lead.serviceType ||
    !lead.projectType ||
    !lead.message
  ) {
    return NextResponse.json(
      { message: "Please complete all required fields." },
      { status: 400 },
    );
  }

  if (!validateEmail(lead.email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!phoneNormalized) {
    return NextResponse.json(
      { message: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  if (!hasFirebaseAdminConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Mock contact lead captured:", lead);
      return NextResponse.json({ ok: true, mock: true });
    }

    return NextResponse.json(
      {
        message:
          "The contact form is not configured yet. Please call or email directly.",
      },
      { status: 503 },
    );
  }

  if (process.env.NODE_ENV === "production" && hasPartialTurnstileConfig()) {
    return NextResponse.json(
      {
        message: getLocalizedMessage(
          locale,
          "The contact form security check is not configured yet. Please call or email directly.",
          "联系表单安全验证尚未配置完成，请直接电话或邮件联系。",
        ),
      },
      { status: 503 },
    );
  }

  const ipAddress = getRequestIpAddress(request);

  if (hasTurnstileConfig()) {
    const turnstileToken = normalizeField(body.turnstileToken, 4096);

    if (!turnstileToken) {
      return NextResponse.json(
        {
          message: getLocalizedMessage(
            locale,
            "Please complete the security check and try again.",
            "请先完成人机验证后再提交。",
          ),
        },
        { status: 400 },
      );
    }

    try {
      const turnstileResult = await validateTurnstileToken(
        turnstileToken,
        ipAddress,
      );

      if (!turnstileResult.success) {
        return NextResponse.json(
          {
            message: getLocalizedMessage(
              locale,
              "Security verification failed. Please try again.",
              "安全验证失败，请重新尝试。",
            ),
          },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Turnstile verification failed:", error);
      return NextResponse.json(
        {
          message: getLocalizedMessage(
            locale,
            "We could not verify the security check. Please try again.",
            "暂时无法完成安全验证，请稍后再试。",
          ),
        },
        { status: 500 },
      );
    }
  }

  try {
    await enforceContactRateLimit(ipAddress);

    const db = getAdminFirestore();
    const collection = db.collection(siteConfig.firebaseCollection);
    const phoneCandidates = buildPhoneCandidates(lead.phone);
    const existingDocs = await findExistingLeadDocs(
      phoneNormalized,
      phoneCandidates,
    );
    const targetDoc = existingDocs[0];
    const currentData = targetDoc?.data() ?? null;
    const isDuplicate = Boolean(targetDoc);
    const targetRef = targetDoc?.ref ?? collection.doc(phoneNormalized);
    const submissionCount =
      getNumberValue(currentData?.submissionCount) + 1 || 1;
    const leadRecord = {
      ...lead,
      phoneNormalized,
      status: getStringValue(currentData?.status) || "new",
      createdAt: getStringValue(currentData?.createdAt) || lead.createdAt,
      updatedAt: lead.createdAt,
      lastSubmittedAt: lead.createdAt,
      submissionCount,
    };

    await targetRef.set(leadRecord, { merge: true });

    if (existingDocs.length > 1) {
      const batch = db.batch();

      existingDocs
        .filter((doc) => doc.ref.path !== targetRef.path)
        .forEach((doc) => {
          batch.delete(doc.ref);
        });

      await batch.commit();
    }

    if (!isDuplicate) {
      try {
        await sendLeadNotification({
          ...leadRecord,
          phoneNormalized,
        });
      } catch (error) {
        console.error("Lead notification failed:", error);
      }
    }

    return NextResponse.json({ ok: true, duplicate: isDuplicate });
  } catch (error) {
    if (error instanceof ContactRateLimitError) {
      return NextResponse.json(
        {
          message: getLocalizedMessage(
            locale,
            "Too many submissions from this connection. Please wait a little and try again, or call us directly.",
            "当前提交过于频繁，请稍等再试，或者直接电话联系。",
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    console.error("Failed to save contact lead:", error);
    return NextResponse.json(
      { message: "We could not save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
