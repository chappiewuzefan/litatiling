import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { getAdminFirestore } from "@/lib/firebase-admin";
import { AREA_TYPES, clearHiddenAreaAnswers, type AreaAnswers, type QuestionnaireAnswers } from "@/lib/questionnaire";

export const QUESTIONNAIRE_COLLECTION = process.env.FIREBASE_QUESTIONNAIRE_COLLECTION ?? "questionnaireSubmissions";
export const UPLOAD_TOKEN_TTL_MS = 60 * 60 * 1000;
export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export type StoredAttachment = {
  storagePath: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
};

export function normalizeQuestionnaireAnswers(value: unknown): QuestionnaireAnswers {
  if (!value || typeof value !== "object") throw new Error("Invalid questionnaire answers.");
  const raw = value as QuestionnaireAnswers;
  return {
    ...raw,
    customer: { ...raw.customer, name: String(raw.customer?.name ?? "").trim().slice(0, 120), phone: String(raw.customer?.phone ?? "").trim().slice(0, 80), email: String(raw.customer?.email ?? "").trim().toLowerCase().slice(0, 160), role: String(raw.customer?.role ?? "").slice(0, 80), roleOther: String(raw.customer?.roleOther ?? "").trim().slice(0, 120) },
    project: Object.fromEntries(Object.entries(raw.project ?? {}).map(([key, entry]) => [key, String(entry ?? "").trim().slice(0, 500)])) as QuestionnaireAnswers["project"],
    areas: Array.isArray(raw.areas) ? raw.areas.slice(0, 10).filter((area): area is AreaAnswers => Boolean(area && AREA_TYPES.includes(area.type))).map((area) => clearHiddenAreaAnswers({ ...area, id: String(area.id).slice(0, 80), customName: String(area.customName ?? "").slice(0, 120), surfaces: Array.isArray(area.surfaces) ? area.surfaces.map(String).slice(0, 2) : [], existingDamage: Array.isArray(area.existingDamage) ? area.existingDamage.map(String).slice(0, 10) : [], extras: Array.isArray(area.extras) ? area.extras.map(String).slice(0, 20) : [], removals: Array.isArray(area.removals) ? area.removals.map(String).slice(0, 20) : [], notes: String(area.notes ?? "").slice(0, 3000) })) : [],
    supplies: { ...raw.supplies },
    additionalNotes: String(raw.additionalNotes ?? "").trim().slice(0, 5000),
    accuracyConfirmed: raw.accuracyConfirmed === true,
    privacyAccepted: raw.privacyAccepted === true,
    company: String(raw.company ?? "").trim().slice(0, 128),
  };
}

export function hashUploadToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createUploadToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashUploadToken(token), expiresAt: new Date(Date.now() + UPLOAD_TOKEN_TTL_MS).toISOString() };
}

export async function authorizeSubmission(id: string, token: string) {
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(id) || !token) throw new Error("Invalid upload authorization.");
  const ref = getAdminFirestore().collection(QUESTIONNAIRE_COLLECTION).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Submission not found.");
  const data = snapshot.data()!;
  const expected = Buffer.from(String(data.uploadTokenHash ?? ""), "hex");
  const actual = Buffer.from(hashUploadToken(token), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Invalid upload authorization.");
  if (Date.parse(String(data.uploadTokenExpiresAt ?? "")) < Date.now()) throw new Error("Upload authorization has expired. Please submit the form again.");
  if (data.status === "submitted") throw new Error("This project has already been submitted.");
  return { ref, data };
}

export function safeFilename(filename: string) {
  const extension = filename.toLowerCase().match(/\.(jpe?g|png|webp|heic|heif|pdf)$/)?.[0] ?? "";
  return `${randomBytes(16).toString("hex")}${extension}`;
}

export function detectAllowedFileType(buffer: Buffer) {
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (["heic", "heix", "hevc", "hevx"].includes(brand)) return "image/heic";
    if (["heif", "heim", "heis", "mif1", "msf1"].includes(brand)) return "image/heif";
  }
  return null;
}
