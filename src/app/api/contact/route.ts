import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { getAdminFirestore, hasFirebaseAdminConfig } from "@/lib/firebase-admin";
import { sendLeadNotification } from "@/lib/lead-notifications";
import { buildPhoneCandidates, normalizePhoneForKey } from "@/lib/phone";
import { siteConfig } from "@/lib/site-config";

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

  try {
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
    console.error("Failed to save contact lead:", error);
    return NextResponse.json(
      { message: "We could not save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
