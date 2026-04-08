import { NextResponse } from "next/server";

import { getAdminFirestore, hasFirebaseAdminConfig } from "@/lib/firebase-admin";
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
    await db.collection(siteConfig.firebaseCollection).add({
      ...lead,
      status: "new",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save contact lead:", error);
    return NextResponse.json(
      { message: "We could not save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
