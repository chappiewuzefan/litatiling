import { randomBytes } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { authorizeSubmission, detectAllowedFileType, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, safeFilename, type StoredAttachment } from "@/lib/questionnaire-server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_ATTACHMENT_BYTES + 1024 * 1024) return NextResponse.json({ message: "The upload is larger than 10 MB." }, { status: 413 });
    const { id } = await context.params;
    const form = await request.formData();
    const token = String(form.get("uploadToken") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ message: "No file was provided." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) return NextResponse.json({ message: "Each file must be between 1 byte and 10 MB." }, { status: 400 });
    const { ref, data } = await authorizeSubmission(id, token);
    const existing = Array.isArray(data.attachments) ? data.attachments as StoredAttachment[] : [];
    if (existing.length >= MAX_ATTACHMENTS) return NextResponse.json({ message: "A maximum of 10 files is allowed." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = detectAllowedFileType(buffer);
    if (!contentType) return NextResponse.json({ message: "The uploaded file content is not a supported JPG, PNG, WEBP, HEIC/HEIF or PDF." }, { status: 400 });
    const storagePath = `questionnaire-submissions/${id}/attachments/${randomBytes(6).toString("hex")}-${safeFilename(file.name)}`;
    await getAdminStorageBucket().file(storagePath).save(buffer, { resumable: false, contentType, metadata: { cacheControl: "private, max-age=0, no-store", metadata: { submissionId: id, originalName: file.name.slice(0, 240) } } });
    const attachment: StoredAttachment = { storagePath, originalName: file.name.slice(0, 240), contentType, size: file.size, uploadedAt: new Date().toISOString() };
    await ref.update({ attachments: FieldValue.arrayUnion(attachment), updatedAt: attachment.uploadedAt });
    return NextResponse.json({ ok: true, attachment: { name: attachment.originalName, size: attachment.size } });
  } catch (error) {
    console.error("Questionnaire attachment upload failed:", error);
    const message = error instanceof Error ? error.message : "Could not upload the file.";
    const status = /authorization|expired|already/.test(message.toLowerCase()) ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
