import { randomUUID } from "node:crypto";

type TurnstileVerifyResponse = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function hasTurnstileSiteKey() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function hasTurnstileSecret() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export function hasTurnstileConfig() {
  return hasTurnstileSiteKey() && hasTurnstileSecret();
}

export function hasPartialTurnstileConfig() {
  return hasTurnstileSiteKey() !== hasTurnstileSecret();
}

export async function validateTurnstileToken(
  token: string,
  ipAddress?: string | null,
) {
  const formData = new FormData();
  formData.set("secret", process.env.TURNSTILE_SECRET_KEY ?? "");
  formData.set("response", token);
  formData.set("idempotency_key", randomUUID());

  if (ipAddress) {
    formData.set("remoteip", ipAddress);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Turnstile verification request failed.");
  }

  const payload = (await response.json()) as TurnstileVerifyResponse;

  return {
    success: payload.success && payload.action === "contact_form",
    errorCodes: payload["error-codes"] ?? [],
    action: payload.action,
    hostname: payload.hostname,
  };
}
