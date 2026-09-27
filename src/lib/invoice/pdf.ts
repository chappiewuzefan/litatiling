import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { aud, type InvoiceVersion, InvoiceError } from "./domain";

const ink = rgb(0.12, 0.17, 0.2), muted = rgb(0.38, 0.42, 0.46), line = rgb(0.85, 0.88, 0.9);
export async function generateInvoicePdf(v: InvoiceVersion, kind: "invoice" | "adjustment" = "invoice", draft = false) {
  if (kind === "adjustment" && !v.adjustment) throw new InvoiceError("此版本没有金额调整", 404);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${kind === "invoice" ? "Tax Invoice" : "Adjustment Note"} ${v.number}`);
  pdf.setAuthor(v.company.name);
  pdf.setCreationDate(new Date(v.createdAt)); pdf.setModificationDate(new Date(v.createdAt));
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const encodes = (font: PDFFont, s: string) => { try { font.encodeText(s); return true; } catch { return false; } };
  const texts: string[] = [];
  JSON.stringify(v, (_key, value) => { if (typeof value === "string") texts.push(value); return value; });
  // The bundled OFL font lets users preview incomplete drafts containing Chinese text. Embed it only when needed:
  // fontkit cannot subset the CFF font when none of its glyphs are used.
  const fallback = texts.some(s => !encodes(regular, s))
    ? await pdf.embedFont(await readFile(path.join(process.cwd(), "src/assets/fonts/NotoSansCJKsc-Regular.otf")), { subset: true })
    : regular;
  const fontFor = (s: string, strong = false): PDFFont => {
    const font = strong ? bold : regular;
    return encodes(font, s) ? font : fallback;
  };
  let page = pdf.addPage([595.28, 841.89]); let y = 796;
  const draw = (s: string, x: number, at: number, size = 10, strong = false, color = ink) => {
    const value = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
    page.drawText(value, { x, y: at, size, font: fontFor(value, strong), color });
  };
  const wrap = (s: string, width: number, size = 10): string[] => {
    const result: string[] = [];
    for (const paragraph of s.split(/\r?\n/)) {
      let current = "";
      const fits = (s: string) => fontFor(s).widthOfTextAtSize(s, size) <= width;
      // Break between words; split a single word by characters only when it is wider than the line.
      for (const token of paragraph.match(/\S+\s*|\s+/g) || [""]) {
        if (fits(current + token.trimEnd())) { current += token; continue; }
        if (current) { result.push(current.trimEnd()); current = ""; }
        for (const char of token.trimStart()) {
          if (!fits(current + char) && current) { result.push(current); current = ""; }
          current += char;
        }
      }
      result.push(current.trimEnd());
    }
    return result;
  };
  const heading = kind === "adjustment" ? "ADJUSTMENT NOTE" : "TAX INVOICE";
  const newPage = () => { page = pdf.addPage([595.28, 841.89]); y = 794; draw(`${heading}  ${v.number}  /  v${v.version}`, 42, y, 11, true); y -= 30; };
  const ensure = (height: number) => { if (y - height < 65) newPage(); };
  const paragraph = (s: string, size = 10, strong = false, width = 505, x = 44) => {
    for (const row of wrap(s, width, size)) { ensure(size + 5); draw(row, x, y, size, strong); y -= size + 5; }
  };
  const section = (s: string) => { ensure(42); y -= 10; draw(s, 44, y, 9, true, muted); y -= 19; };
  const right = (s: string, edge: number, at: number, size = 10, strong = false) => draw(s, edge - fontFor(s, strong).widthOfTextAtSize(s, size), at, size, strong);

  draw("LITA", 42, y, 29, true); right(heading, 551, y + 2, 18, true); y -= 28;
  right(`${v.number}  |  Version ${v.version}`, 551, y, 10);
  y -= 22;
  paragraph(v.company.name, 12, true);
  paragraph(`ABN ${v.company.abn || "-"}`);
  if (v.company.address) paragraph(v.company.address);
  paragraph([v.company.email, v.company.phone].filter(Boolean).join("  |  "));
  y -= 7;
  paragraph(`Invoice date: ${v.input.date}     Payment due: ${v.input.dueDate}     Currency: AUD`);
  if (v.version > 1) paragraph(`Reissued: ${v.createdAt.slice(0, 10)} | Supersedes version ${v.version - 1}`);
  if (kind === "adjustment") paragraph(`Adjustment number: ${v.number}-ADJ-${v.version} | Issued: ${v.createdAt.slice(0, 10)}`);
  if (v.input.purchaseOrder) paragraph(`Purchase order: ${v.input.purchaseOrder}`);
  section("BILL TO"); paragraph(v.input.customer.name || "Customer", 11, true);
  if (v.input.customer.billingAddress) paragraph(v.input.customer.billingAddress);
  if (v.input.customer.abn) paragraph(`Customer ABN: ${v.input.customer.abn}`);
  if (v.input.siteAddress) { section("WORK SITE"); paragraph(v.input.siteAddress); }
  if (kind === "adjustment") {
    const a = v.adjustment!;
    section("ADJUSTMENT DETAILS");
    paragraph(`Related invoice: ${v.number}, version ${a.previousVersion}`);
    paragraph(`Reason: ${a.reason}`);
    paragraph(`Previous total (including GST): ${aud(a.previousTotal)}`);
    paragraph(`Revised total (including GST): ${aud(a.previousTotal + a.deltaTotal)}`);
    paragraph(`GST adjustment: ${aud(a.deltaGst)}`);
    paragraph(`${a.deltaTotal <= 0 ? "Credit / reduction" : "Debit / increase"} (including GST): ${aud(Math.abs(a.deltaTotal))}`, 13, true);
    paragraph("This adjustment relates to the invoice above; it is not an additional invoice.");
    paragraph("The related reissued invoice records the revised taxable supplies.");
  } else {
    y -= 22;
    const tableHeader = () => {
      ensure(45);
      page.drawRectangle({ x: 42, y: y - 9, width: 511, height: 25, color: rgb(0.94, 0.96, 0.97) });
      draw("Description", 48, y, 9, true); right("Qty / unit", 364, y, 9, true); right("Unit price", 450, y, 9, true); right("Amount", 545, y, 9, true); y -= 30;
    };
    tableHeader();
    v.input.items.forEach((item, index) => {
      const rows = wrap(item.description || "Item", 238, 10);
      rows.forEach((row, rowIndex) => {
        if (y < 88) { newPage(); tableHeader(); }
        draw(row, 48, y, 10);
        if (rowIndex === 0) {
          right(`${item.quantity || "0"} ${item.unit}`, 364, y, 9);
          right(aud(Math.round(Number(item.unitPrice || "0") * 100)), 450, y, 10);
          right(aud(v.totals.lines[index] || 0), 545, y, 10);
        }
        y -= 15;
      });
      page.drawLine({ start: { x: 44, y: y + 5 }, end: { x: 551, y: y + 5 }, color: line, thickness: 0.4 }); y -= 10;
    });
    ensure(102); y -= 8;
    draw("Subtotal (excluding GST)", 296, y, 10); right(aud(v.totals.subtotal), 546, y); y -= 22;
    draw("GST (10%)", 296, y, 10); right(aud(v.totals.gst), 546, y); y -= 29;
    draw("TOTAL AUD (including GST)", 264, y, 12, true); right(aud(v.totals.total), 546, y, 14, true); y -= 22;
    if (v.input.notes) { section("NOTES"); paragraph(v.input.notes); }
    if (v.version > 1) { section("CORRECTION"); paragraph(v.reason); }
  }
  if (!v.void && kind === "invoice") {
    section("PAYMENT DETAILS");
    paragraph(`Account name: ${v.company.bankAccountName || "-"}`);
    paragraph(`BSB: ${v.company.bsb || "-"}     Account number: ${v.company.bankAccountNumber || "-"}`);
    paragraph(`Payment reference: ${v.number}`);
  }
  pdf.getPages().forEach((p, i, pages) => {
    p.drawText(`${v.number}  |  v${v.version}  |  ${i + 1} / ${pages.length}`, { x: 44, y: 31, size: 8, font: regular, color: muted });
    if (draft || v.void) p.drawText(draft ? "DRAFT" : "VOID", { x: 155, y: 345, size: 82, font: bold, rotate: degrees(35), color: rgb(0.7, 0.3, 0.25), opacity: 0.13 });
  });
  return Buffer.from(await pdf.save());
}

export async function archivedPdf(id: string, version: InvoiceVersion, kind: "invoice" | "adjustment") {
  const file = getAdminStorageBucket().file(`invoices/${id}/v${version.version}/${kind}.pdf`);
  const [exists] = await file.exists();
  if (!exists) {
    const buffer = await generateInvoicePdf(version, kind);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    try {
      await file.save(buffer, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: "application/pdf", cacheControl: "private, no-store", metadata: { sha256, templateVersion: "1" } } });
    } catch (error) {
      // A concurrent retry may have won the create-only write. Never overwrite that artifact.
      if ((error as { code?: number }).code !== 412) throw error;
    }
  }
  const [buffer] = await file.download();
  const [metadata] = await file.getMetadata();
  if (metadata.metadata?.sha256 !== createHash("sha256").update(buffer).digest("hex")) throw new InvoiceError("归档文件校验失败，请联系管理员", 503);
  return buffer;
}
