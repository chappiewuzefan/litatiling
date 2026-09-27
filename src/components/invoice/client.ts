import type { Company, Customer, InvoiceRecord, InvoiceVersion, Payment, Preset } from "@/lib/invoice/domain";

export type CustomerEntry = Customer & { id: string; version: number };
export type PresetEntry = Preset & { id: string; version: number };
export type Bootstrap = { settings: { company: Company; version: number }; customers: CustomerEntry[]; items: PresetEntry[] };
export type Detail = { invoice: InvoiceRecord; versions: InvoiceVersion[]; payments: Payment[] };
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
let csrf = "";
export function setCsrf(token: string) { csrf = token; }
export async function api<T>(path: string, data?: unknown, method = "POST"): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/invoice/${path}`, { method: data === undefined ? "GET" : method, credentials: "same-origin", cache: "no-store", headers: data === undefined ? {} : { "Content-Type": "application/json", "x-csrf-token": csrf }, body: data === undefined ? undefined : JSON.stringify(data) });
  } catch { throw new ApiError("网络连接失败，请检查网络后重试。已填写的内容仍在页面上。", 0); }
  const result = await response.json().catch(() => ({}));
  // Let the app show a re-login dialog over the current screen so unsaved work stays in place.
  if (response.status === 401 && path !== "session") window.dispatchEvent(new Event(sessionExpiredEvent));
  if (!response.ok) throw new ApiError(result.error || "操作失败，请重试", response.status);
  return result;
}
export const sessionExpiredEvent = "lita-invoice-session-expired";
export const errorText = (error: unknown) => error instanceof Error ? error.message : "操作失败，请重试";
export const uid = () => crypto.randomUUID();

// Retry a failed action with the same operation id; changing its body creates a different request.
export function createCommandSender() {
  const keys = new Map<string, string>();
  return async (command: Record<string, unknown>) => {
    const fingerprint = JSON.stringify(command);
    const operationId = keys.get(fingerprint) || uid(); keys.set(fingerprint, operationId);
    return api<{ invoice: InvoiceRecord; archiveReady: boolean }>("commands", { ...command, operationId });
  };
}
