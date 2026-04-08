import nodemailer from "nodemailer";

import { siteConfig } from "@/lib/site-config";

type LeadNotificationPayload = {
  name: string;
  phone: string;
  phoneNormalized: string;
  email: string;
  suburb: string;
  serviceType: string;
  projectType: string;
  preferredLanguage: string;
  message: string;
  sourcePage: string;
  createdAt: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSmtpPort() {
  const parsed = Number(process.env.SMTP_PORT ?? "465");
  return Number.isFinite(parsed) ? parsed : 465;
}

function isSecureTransport(port: number) {
  const configured = process.env.SMTP_SECURE;

  if (configured === "false") {
    return false;
  }

  if (configured === "true") {
    return true;
  }

  return port === 465;
}

export function hasLeadNotificationConfig() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const port = getSmtpPort();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: isSecureTransport(port),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildTextBody(lead: LeadNotificationPayload) {
  return [
    `New website enquiry for ${siteConfig.brandName}`,
    "",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Normalized phone: ${lead.phoneNormalized}`,
    `Email: ${lead.email}`,
    `Suburb: ${lead.suburb}`,
    `Service type: ${lead.serviceType}`,
    `Project type: ${lead.projectType}`,
    `Preferred language: ${lead.preferredLanguage}`,
    `Source page: ${lead.sourcePage}`,
    `Submitted at: ${lead.createdAt}`,
    "",
    "Message:",
    lead.message,
  ].join("\n");
}

function buildHtmlBody(lead: LeadNotificationPayload) {
  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Normalized phone", lead.phoneNormalized],
    ["Email", lead.email],
    ["Suburb", lead.suburb],
    ["Service type", lead.serviceType],
    ["Project type", lead.projectType],
    ["Preferred language", lead.preferredLanguage],
    ["Source page", lead.sourcePage],
    ["Submitted at", lead.createdAt],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;border:1px solid #dbe4ef;">${escapeHtml(
          label,
        )}</td><td style="padding:8px 12px;border:1px solid #dbe4ef;">${escapeHtml(
          value,
        )}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial, sans-serif;color:#0f172a;line-height:1.6;">
      <h2 style="margin:0 0 16px;">New website enquiry</h2>
      <p style="margin:0 0 16px;">A new enquiry was submitted on ${siteConfig.brandName}.</p>
      <table style="border-collapse:collapse;margin:0 0 20px;min-width:320px;">
        <tbody>${rows}</tbody>
      </table>
      <h3 style="margin:0 0 8px;">Message</h3>
      <div style="padding:12px 14px;border:1px solid #dbe4ef;border-radius:12px;white-space:pre-wrap;">${escapeHtml(
        lead.message,
      )}</div>
    </div>
  `;
}

export async function sendLeadNotification(lead: LeadNotificationPayload) {
  if (!hasLeadNotificationConfig()) {
    console.warn(
      "Lead notification skipped: SMTP_USER / SMTP_PASS are not configured.",
    );
    return false;
  }

  const transport = createTransport();
  const to = process.env.NOTIFICATION_TO ?? siteConfig.email;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? siteConfig.email;

  await transport.sendMail({
    from,
    to,
    replyTo: lead.email,
    subject: `[LITA Tiling] New enquiry from ${lead.name} (${lead.phone})`,
    text: buildTextBody(lead),
    html: buildHtmlBody(lead),
  });

  return true;
}
