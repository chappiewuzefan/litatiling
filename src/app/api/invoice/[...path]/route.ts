import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { assertAllowedUid, checkWriteOrigin, cookieOptions, CSRF, csrfToken, privateJson, publicFirebaseConfig, requireInvoiceUser, SESSION, sessionSeconds } from "@/lib/invoice/auth";
import { csvCell, InvoiceError, paymentState, type InvoiceVersion } from "@/lib/invoice/domain";
import { archivedPdf, describeError, generateInvoicePdf } from "@/lib/invoice/pdf";
import { commandSchema, InvoiceStore } from "@/lib/invoice/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const responsePdf = (buffer: Buffer, filename: string) => new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${filename}"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" } });
function fail(error: unknown) {
  if (error instanceof z.ZodError) return privateJson({ error: error.issues.map(i => `${i.path.join(".")}: ${i.message}`).slice(0, 3).join("; ") }, 400);
  if (error instanceof InvoiceError) return privateJson({ error: error.message }, error.status);
  console.error("Invoice request failed", describeError(error));
  return privateJson({ error: "服务暂时不可用。请重试；已保存的数据不会重复创建。" }, 503);
}
async function body(request: NextRequest) {
  if (Number(request.headers.get("content-length")) > 250000) throw new InvoiceError("请求过大", 413);
  const raw = await request.text();
  if (raw.length > 250000) throw new InvoiceError("请求过大", 413);
  try { return JSON.parse(raw); } catch { throw new InvoiceError("请求内容不正确"); }
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    if (path.join("/") === "session") {
      const token = csrfToken(request);
      let authenticated = false;
      if (request.cookies.get(SESSION)?.value) {
        try { await requireInvoiceUser(request); authenticated = true; } catch { /* login screen */ }
      }
      const response = privateJson({ authenticated, csrf: token, config: publicFirebaseConfig() });
      response.cookies.set(CSRF, token, { ...cookieOptions, maxAge: sessionSeconds });
      return response;
    }
    await requireInvoiceUser(request);
    const store = new InvoiceStore(getAdminFirestore());
    if (path.join("/") === "bootstrap") {
      const [settings, customers, items] = await Promise.all([store.settings(), store.catalog("customers"), store.catalog("items")]);
      return privateJson({ settings, customers, items });
    }
    if (path.join("/") === "records") return privateJson(await store.list());
    if (path[0] === "records" && path.length === 2) return privateJson(await store.detail(path[1]));
    if (path[0] === "files" && path.length === 4) {
      const version = await store.getVersion(path[1], Number(path[2]));
      const kind = z.enum(["invoice", "adjustment"]).parse(path[3]);
      const buffer = await archivedPdf(path[1], version, kind);
      return responsePdf(buffer, `${version.number}-v${version.version}-${kind}.pdf`);
    }
    if (path[0] === "preview" && path.length === 2) {
      const { invoice } = await store.detail(path[1]);
      if (invoice.status !== "draft") throw new InvoiceError("请下载正式版本");
      const { company } = await store.settings();
      const draft: InvoiceVersion = { number: "DRAFT", version: 0, input: invoice.input, company, totals: invoice.totals, createdAt: invoice.updatedAt, reason: "", templateVersion: 1, void: false, adjustment: null };
      return responsePdf(await generateInvoicePdf(draft, "invoice", true), "LITA-DRAFT.pdf");
    }
    if (path.join("/") === "export") {
      const rows = await store.list();
      const csv = [["Invoice", "Date", "Customer", "Site", "Status", "Subtotal AUD", "GST AUD", "Total AUD", "Received AUD", "Balance AUD"], ...rows.map(r => [r.number || "DRAFT", r.input.date, r.input.customer.name, r.input.siteAddress, r.status, (r.totals.subtotal / 100).toFixed(2), (r.totals.gst / 100).toFixed(2), (r.totals.total / 100).toFixed(2), (r.paidCents / 100).toFixed(2), (paymentState(r).balance / 100).toFixed(2)])].map(row => row.map(csvCell).join(",")).join("\r\n");
      return new NextResponse(`\ufeff${csv}`, { headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": 'attachment; filename="LITA-invoices.csv"', "Cache-Control": "private, no-store" } });
    }
    throw new InvoiceError("接口不存在", 404);
  } catch (error) { return fail(error); }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    checkWriteOrigin(request);
    const { path } = await context.params;
    if (path.join("/") === "session") {
      const { idToken } = z.object({ idToken: z.string().min(10).max(10000) }).parse(await body(request));
      let decoded;
      try { decoded = await getAdminAuth().verifyIdToken(idToken, true); } catch { throw new InvoiceError("登录验证失败", 401); }
      assertAllowedUid(decoded.uid);
      if (Date.now() / 1000 - decoded.auth_time > 300) throw new InvoiceError("请重新登录", 401);
      const cookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn: sessionSeconds * 1000 });
      const response = privateJson({ ok: true });
      response.cookies.set(SESSION, cookie, { ...cookieOptions, maxAge: sessionSeconds });
      return response;
    }
    const user = await requireInvoiceUser(request);
    const store = new InvoiceStore(getAdminFirestore());
    if (path.join("/") === "commands") {
      const command = commandSchema.parse(await body(request));
      const invoice = await store.command(command, user.uid);
      let archiveReady = true;
      if (["issue", "revise", "void"].includes(command.action)) {
        try {
          const version = await store.getVersion(invoice.id, invoice.version);
          await archivedPdf(invoice.id, version, "invoice", true);
          if (version.adjustment) await archivedPdf(invoice.id, version, "adjustment", true);
        } catch (error) { archiveReady = false; console.error("Invoice archive failed after command", describeError(error)); }
      }
      return privateJson({ invoice, archiveReady });
    }
    if (path.join("/") === "settings") {
      const input = z.object({ company: z.unknown(), version: z.number().int().min(0) }).parse(await body(request));
      return privateJson(await store.saveSettings(input.company, input.version));
    }
    if ((path[0] === "customers" || path[0] === "items") && path.length === 2) {
      const input = z.object({ data: z.unknown(), version: z.number().int().min(0) }).parse(await body(request));
      return privateJson(await store.saveCatalog(path[0], path[1], input.data, input.version));
    }
    throw new InvoiceError("接口不存在", 404);
  } catch (error) { return fail(error); }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    checkWriteOrigin(request);
    const { path } = await context.params;
    if ((path[0] === "customers" || path[0] === "items") && path.length === 2) {
      await requireInvoiceUser(request);
      const { version } = z.object({ version: z.number().int().min(0) }).parse(await body(request));
      return privateJson(await new InvoiceStore(getAdminFirestore()).deleteCatalog(path[0], path[1], version));
    }
    if (path.join("/") !== "session") throw new InvoiceError("不支持删除历史记录", 405);
    const response = privateJson({ ok: true });
    response.cookies.set(SESSION, "", { ...cookieOptions, maxAge: 0 });
    response.cookies.set(CSRF, "", { ...cookieOptions, maxAge: 0 });
    return response;
  } catch (error) { return fail(error); }
}
