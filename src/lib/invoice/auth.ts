import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { InvoiceError } from "./domain";

export const SESSION = "lita_invoice_session";
export const CSRF = "lita_invoice_csrf";
export const sessionSeconds = 60 * 60 * 24 * 5;
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export function assertAllowedUid(uid: string) {
  if (!process.env.INVOICE_ALLOWED_UID || uid !== process.env.INVOICE_ALLOWED_UID) throw new InvoiceError("此账号没有开票权限", 403);
}
export async function requireInvoiceUser(request: NextRequest) {
  const session = request.cookies.get(SESSION)?.value;
  if (!session) throw new InvoiceError("请先登录", 401);
  let user;
  try { user = await getAdminAuth().verifySessionCookie(session, true); }
  catch { throw new InvoiceError("登录已过期，请重新登录", 401); }
  assertAllowedUid(user.uid);
  return user;
}
export function checkWriteOrigin(request: NextRequest) {
  const configured = (process.env.INVOICE_ALLOWED_ORIGINS || "https://invoice.litatiling.com,https://www.litatiling.com").split(",").map(x => x.trim());
  const origin = request.headers.get("origin") || "";
  const local = process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  if (!configured.includes(origin) && !local) throw new InvoiceError("请求来源不允许", 403);
  const cookie = request.cookies.get(CSRF)?.value || "";
  const header = request.headers.get("x-csrf-token") || "";
  if (!/^[a-f0-9]{64}$/.test(cookie) || cookie.length !== header.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) throw new InvoiceError("安全验证过期，请刷新页面", 403);
}
export function privateJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Vary": "Cookie" } });
}
export function csrfToken(request: NextRequest) {
  const current = request.cookies.get(CSRF)?.value;
  return current && /^[a-f0-9]{64}$/.test(current) ? current : randomBytes(32).toString("hex");
}
export function publicFirebaseConfig() {
  const apiKey = process.env.INVOICE_FIREBASE_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId || !process.env.INVOICE_ALLOWED_UID) return null;
  return { apiKey, projectId, authDomain: `${projectId}.firebaseapp.com` };
}
