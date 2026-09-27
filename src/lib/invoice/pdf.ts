import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { aud, formatAbn, formatBsb, formatDate, type InvoiceVersion, InvoiceError } from "./domain";

const A4: [number, number] = [595.28, 841.89];
const left = 44, edge = 551;
const ink = rgb(0.13, 0.15, 0.17), muted = rgb(0.42, 0.45, 0.48), line = rgb(0.86, 0.88, 0.9), soft = rgb(0.955, 0.965, 0.965);
const accent = rgb(0.137, 0.302, 0.282), red = rgb(0.7, 0.2, 0.16), redSoft = rgb(0.99, 0.94, 0.93);

export async function generateInvoicePdf(v: InvoiceVersion, kind: "invoice" | "adjustment" = "invoice", draft = false) {
  if (kind === "adjustment" && !v.adjustment) throw new InvoiceError("此版本没有金额调整", 404);
  const adjustment = kind === "adjustment" ? v.adjustment! : null;
  const title = adjustment ? "ADJUSTMENT NOTE" : "TAX INVOICE";
  // Drafts have no number yet: omit number and reference fields instead of printing a placeholder.
  const documentNumber = adjustment ? `${v.number}-ADJ-${v.version}` : draft ? "" : v.number;
  const reference = draft ? "" : v.number;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${adjustment ? "Adjustment Note" : "Tax Invoice"} ${documentNumber || "(draft)"}`);
  pdf.setAuthor(v.company.name);
  pdf.setCreationDate(new Date(v.createdAt)); pdf.setModificationDate(new Date(v.createdAt));
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const encodes = (font: PDFFont, s: string) => { try { font.encodeText(s); return true; } catch { return false; } };
  const texts: string[] = [];
  JSON.stringify(v, (_key, value) => { if (typeof value === "string") texts.push(value); return value; });
  // The bundled OFL font lets users preview incomplete drafts containing Chinese text. Embed it only when needed:
  // fontkit cannot subset the CFF font when none of its glyphs are used.
  const fallback = texts.some(s => !encodes(regular, s.replace(/[\u0000-\u001f]/g, "")))
    ? await pdf.embedFont(await readFile(path.join(process.cwd(), "src/assets/fonts/NotoSansCJKsc-Regular.otf")), { subset: true })
    : regular;
  const fontFor = (s: string, strong = false): PDFFont => {
    const font = strong ? bold : regular;
    return encodes(font, s) ? font : fallback;
  };
  const identity = [v.company.name, v.company.abn && `ABN ${formatAbn(v.company.abn)}`].filter(Boolean).join("  ·  ");

  let page: PDFPage = null!, y = 0;
  const draw = (s: string, x: number, at: number, size = 10, strong = false, color = ink) => {
    const value = s.replace(/[\u0000-\u001f]/g, "");
    if (value) page.drawText(value, { x, y: at, size, font: fontFor(value, strong), color });
  };
  const width = (s: string, size = 10, strong = false) => fontFor(s, strong).widthOfTextAtSize(s, size);
  const right = (s: string, x: number, at: number, size = 10, strong = false, color = ink) => draw(s, x - width(s, size, strong), at, size, strong, color);
  const wrap = (s: string, max: number, size = 10, strong = false): string[] => {
    const result: string[] = [];
    for (const paragraph of s.split(/\r?\n/)) {
      let current = "";
      const fits = (t: string) => width(t, size, strong) <= max;
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
  // Draws wrapped text downward from `at` and returns the next free baseline.
  const block = (s: string, x: number, at: number, max: number, size = 9.5, strong = false, color = ink) => {
    for (const row of wrap(s, max, size, strong)) { draw(row, x, at, size, strong, color); at -= size + 4.5; }
    return at;
  };
  const label = (s: string, x: number, at: number) => draw(s, x, at, 7.5, true, muted);
  // A light company/ABN pattern sits behind every page so copies stay attributable without hiding content.
  const watermark = () => {
    if (!identity) return;
    const size = 11, step = width(identity, size) + 56, gap = 78, c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
    for (let k = -12; k <= 12; k++) for (let j = -4; j <= 4; j++) {
      const shift = (k % 2) * step / 2;
      const x = 297 + (j * step + shift) * c - k * gap * s, at = 421 + (j * step + shift) * s + k * gap * c;
      if (x < -step || x > A4[0] || at < -step || at > A4[1] + 20) continue;
      page.drawText(identity, { x, y: at, size, font: fontFor(identity), color: rgb(0.4, 0.45, 0.47), opacity: 0.07, rotate: degrees(30) });
    }
  };
  const newPage = (continued: boolean) => {
    page = pdf.addPage(A4); watermark(); y = 797;
    if (continued) {
      draw(`${[title, documentNumber].filter(Boolean).join("  ")}  (continued)`, left, y, 9, true, muted);
      y -= 26;
    }
  };
  const ensure = (height: number, after?: () => void) => { if (y - height < 72) { newPage(true); after?.(); } };
  const banner = (text: string, color: typeof red, background: typeof red) => {
    const rows = wrap(text, edge - left - 20, 9, true);
    const height = rows.length * 13 + 10;
    page.drawRectangle({ x: left, y: y - height + 9, width: edge - left, height, color: background });
    rows.forEach((row, i) => draw(row, left + 10, y - i * 13, 9, true, color));
    y -= height + 8;
  };

  newPage(false);
  // FROM (supplier) on the left, document details on the right, as on LITA's paper tax invoice book.
  let fromY = block(v.company.name, left, y - 2, 280, 15, true) - 1;
  if (v.company.abn) { draw(`ABN ${formatAbn(v.company.abn)}`, left, fromY, 9.5); fromY -= 14; }
  if (v.company.address) fromY = block(v.company.address, left, fromY, 280, 9.5, false, muted);
  const contact = [v.company.email, v.company.phone].filter(Boolean).join("  ·  ");
  if (contact) fromY = block(contact, left, fromY, 280, 9.5, false, muted);
  right(title, edge, y - 4, 20, true, accent);
  const details: [string, string][] = adjustment
    ? [["Adjustment No.", documentNumber], ["Date", formatDate(v.createdAt.slice(0, 10))], ["Related invoice", v.number]]
    : [["Invoice No.", reference], ["Date", formatDate(v.input.date)], ["Due date", v.input.dueDate ? formatDate(v.input.dueDate) : ""]];
  if (!adjustment && v.input.purchaseOrder) details.push(["Order No.", v.input.purchaseOrder]);
  let detailY = y - 30;
  const shown = details.filter(([, value]) => value);
  const labelEdge = edge - Math.max(...shown.map(([name, value]) => width(value, 9.5, name.endsWith("No.")))) - 14;
  for (const [name, value] of shown) {
    right(name, Math.min(452, labelEdge), detailY, 9, false, muted);
    right(value, edge, detailY, 9.5, name.endsWith("No."));
    detailY -= 15;
  }
  y = Math.min(fromY, detailY) - 10;

  if (draft) banner("DRAFT - for review only. This is not a valid tax invoice until it is issued.", red, redSoft);
  if (v.void && !adjustment) banner(`VOID - this invoice has been cancelled. Reason: ${v.reason}`, red, redSoft);
  else if (v.version > 1 && !adjustment) banner(`Revised invoice - version ${v.version}, issued ${formatDate(v.createdAt.slice(0, 10))}. Supersedes version ${v.version - 1}. Reason: ${v.reason}`, accent, soft);

  page.drawLine({ start: { x: left, y }, end: { x: edge, y }, color: line, thickness: 0.8 });
  y -= 20;
  // TO (recipient) and the work site side by side.
  const customer = v.input.customer;
  label("BILL TO", left, y);
  let toY = y - 15;
  if (customer.name) toY = block(customer.name, left, toY, 240, 11, true);
  if (customer.billingAddress) toY = block(customer.billingAddress, left, toY, 240);
  if (customer.abn) { draw(`ABN ${formatAbn(customer.abn)}`, left, toY, 9.5); toY -= 14; }
  // Without customer details the work site is the recipient, as on the paper invoices.
  const siteAsRecipient = !customer.name && !customer.billingAddress && !customer.abn;
  if (siteAsRecipient) toY = block(v.input.siteAddress, left, toY, 240);
  let siteY = y - 15;
  if (v.input.siteAddress && !siteAsRecipient) { label("WORK SITE", 310, y); siteY = block(v.input.siteAddress, 310, siteY, 240); }
  y = Math.min(toY, siteY) - 16;

  if (adjustment) {
    ensure(170);
    label("ADJUSTMENT DETAILS", left, y); y -= 18;
    const rows: [string, string][] = [
      ["Previous total (including GST)", aud(adjustment.previousTotal)],
      ["Revised total (including GST)", aud(adjustment.previousTotal + adjustment.deltaTotal)],
      ["GST adjustment", aud(adjustment.deltaGst)],
    ];
    for (const [name, value] of rows) { draw(name, left, y, 10); right(value, edge - 8, y, 10); y -= 20; }
    y -= 8;
    page.drawRectangle({ x: left, y: y - 9, width: edge - left, height: 28, color: accent });
    draw(`${adjustment.deltaTotal <= 0 ? "Decrease" : "Increase"} (including GST)`, left + 10, y, 11, true, rgb(1, 1, 1));
    right(aud(Math.abs(adjustment.deltaTotal)), edge - 8, y, 13, true, rgb(1, 1, 1));
    y -= 36;
    y = block(`Reason: ${adjustment.reason}`, left, y, edge - left, 10) - 4;
    y = block(`This note adjusts invoice ${v.number} (version ${adjustment.previousVersion}). It is not an additional invoice; the reissued invoice version ${v.version} records the revised supplies.`, left, y, edge - left, 9.5, false, muted);
  } else {
    const qtyX = left + 6, descX = 118, descWidth = 250, priceEdge = 462, amountEdge = edge - 6;
    const tableHeader = () => {
      page.drawRectangle({ x: left, y: y - 8, width: edge - left, height: 24, color: soft });
      draw("Qty", qtyX, y, 8.5, true, muted); draw("Description", descX, y, 8.5, true, muted);
      right("Unit price", priceEdge, y, 8.5, true, muted); right("Amount (ex GST)", amountEdge, y, 8.5, true, muted);
      y -= 28;
    };
    ensure(80); tableHeader();
    v.input.items.forEach((item, index) => {
      const rows = wrap(item.description || "Item", descWidth, 10);
      ensure(Math.min(rows.length, 3) * 14 + 12, tableHeader);
      rows.forEach((row, rowIndex) => {
        if (rowIndex > 0) ensure(14, tableHeader);
        draw(row, descX, y, 10);
        if (rowIndex === 0) {
          draw(`${item.quantity || "0"} ${item.unit}`, qtyX, y, 9.5);
          right(aud(Math.round(Number(item.unitPrice || "0") * 100)), priceEdge, y, 10);
          right(aud(v.totals.lines[index] || 0), amountEdge, y, 10);
        }
        y -= 14;
      });
      page.drawLine({ start: { x: left, y: y + 4 }, end: { x: edge, y: y + 4 }, color: line, thickness: 0.5 });
      y -= 10;
    });
    ensure(96); y -= 6;
    draw("Subtotal (excluding GST)", 318, y, 10, false, muted); right(aud(v.totals.subtotal), amountEdge, y, 10); y -= 20;
    draw("GST (10%)", 318, y, 10, false, muted); right(aud(v.totals.gst), amountEdge, y, 10); y -= 16;
    page.drawRectangle({ x: 308, y: y - 18, width: edge - 308, height: 30, color: accent });
    draw("TOTAL (inc. GST)", 318, y - 8, 11, true, rgb(1, 1, 1)); right(aud(v.totals.total), amountEdge, y - 8, 14, true, rgb(1, 1, 1));
    y -= 48;

    if (!v.void) {
      // Bank details are what the customer acts on, so they get the most visible block after the total.
      ensure(104);
      const note = [v.input.dueDate && `Please pay by ${formatDate(v.input.dueDate)}`, reference && "quote the reference above when paying"].filter(Boolean).join(" and ");
      const top = y, height = note ? 88 : 70;
      page.drawRectangle({ x: left, y: top - height + 12, width: edge - left, height, color: soft });
      page.drawRectangle({ x: left, y: top - height + 12, width: 4, height, color: accent });
      label("PAYMENT BY BANK TRANSFER", left + 16, top - 4);
      const cells: [string, string, number][] = [
        ["Account name", v.company.bankAccountName || "-", 11], ["BSB", v.company.bsb ? formatBsb(v.company.bsb) : "-", 15],
        ["Account number", v.company.bankAccountNumber || "-", 15],
      ];
      if (reference) cells.push(["Reference", reference, 11]);
      const xs = [left + 16, 236, 326, 446];
      cells.forEach(([name, value, size], i) => {
        draw(name, xs[i], top - 24, 8, false, muted);
        block(value, xs[i], top - 42, i === 0 ? 176 : edge - xs[i] - 4, size, true);
      });
      if (note) draw(`${note.charAt(0).toUpperCase()}${note.slice(1)}.`, left + 16, top - 68, 8.5, false, muted);
      y = top - height - 10;
    }
    if (v.input.notes) {
      ensure(40); label("NOTES", left, y); y -= 15;
      for (const row of wrap(v.input.notes, edge - left, 9.5)) { ensure(14); draw(row, left, y, 9.5); y -= 14; }
    }
  }

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: left, y: 46 }, end: { x: edge, y: 46 }, color: line, thickness: 0.5 });
    const footer = identity || v.company.name;
    p.drawText(footer, { x: left, y: 32, size: 7.5, font: fontFor(footer), color: muted });
    const meta = [documentNumber, v.version > 1 ? `Version ${v.version}` : "", `Page ${i + 1} of ${pages.length}`].filter(Boolean).join("  ·  ");
    p.drawText(meta, { x: edge - fontFor(meta).widthOfTextAtSize(meta, 7.5), y: 32, size: 7.5, font: fontFor(meta), color: muted });
    if (v.void && !adjustment) p.drawText("VOID", { x: 170, y: 330, size: 90, font: bold, rotate: degrees(35), color: red, opacity: 0.12 });
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
      await file.save(buffer, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: "application/pdf", cacheControl: "private, no-store", metadata: { sha256, templateVersion: String(version.templateVersion) } } });
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
