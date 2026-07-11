import { NextResponse } from "next/server";

import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { sendQuestionnaireNotification } from "@/lib/lead-notifications";
import { areaLabels, type QuestionnaireAnswers } from "@/lib/questionnaire";
import { generateQuestionnairePdf } from "@/lib/questionnaire-pdf";
import { authorizeSubmission, type StoredAttachment } from "@/lib/questionnaire-server";

const SIGNED_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function signedUrl(storagePath: string) {
  const [url] = await getAdminStorageBucket().file(storagePath).getSignedUrl({ action: "read", expires: Date.now() + SIGNED_LINK_TTL_MS });
  return url;
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { uploadToken?: string };
    const { ref, data } = await authorizeSubmission(id, String(body.uploadToken ?? ""));
    const answers = data.answers as QuestionnaireAnswers;
    const attachments = (Array.isArray(data.attachments) ? data.attachments : []) as StoredAttachment[];
    const submittedAt = new Date().toISOString();
    await ref.update({ status: "finalizing", updatedAt: submittedAt });
    try {
      const pdf = await generateQuestionnairePdf(answers, attachments, id, submittedAt);
      const pdfStoragePath = `questionnaire-submissions/${id}/summary/${id}-tiling-project.pdf`;
      await getAdminStorageBucket().file(pdfStoragePath).save(pdf, { resumable: false, contentType: "application/pdf", metadata: { cacheControl: "private, max-age=0, no-store", metadata: { submissionId: id } } });
      const [pdfUrl, attachmentLinks] = await Promise.all([signedUrl(pdfStoragePath), Promise.all(attachments.map(async (item) => ({ name: item.originalName, url: await signedUrl(item.storagePath) })))]);
      let notificationStatus = "sent";
      try {
        const sent = await sendQuestionnaireNotification({ submissionId: id, customerName: answers.customer.name, phone: answers.customer.phone, email: answers.customer.email, address: answers.project.address, areaNames: answers.areas.map((area) => area.customName || areaLabels[area.type].en), submittedAt, pdfUrl, attachmentLinks });
        if (!sent) notificationStatus = "skipped";
      } catch (notificationError) {
        notificationStatus = "failed";
        console.error("Questionnaire notification failed:", notificationError);
      }
      await ref.update({ status: "submitted", submittedAt, updatedAt: submittedAt, pdfStoragePath, notificationStatus, uploadTokenHash: null, uploadTokenExpiresAt: null });
      return NextResponse.json({ ok: true, id });
    } catch (error) {
      await ref.update({ status: "uploading", updatedAt: new Date().toISOString(), finalizeError: error instanceof Error ? error.message.slice(0, 500) : "Unknown finalize error" });
      throw error;
    }
  } catch (error) {
    console.error("Questionnaire finalize failed:", error);
    const message = error instanceof Error ? error.message : "Could not finalize the submission.";
    const status = /authorization|expired|already/.test(message.toLowerCase()) ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
