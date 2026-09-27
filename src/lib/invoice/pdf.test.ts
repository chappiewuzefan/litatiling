import { PDFDocument } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";
import { calculateTotals, defaultCompany, type InvoiceVersion } from "./domain";
import { archivedPdf, generateInvoicePdf } from "./pdf";

vi.mock("@/lib/firebase-admin", () => ({ getAdminStorageBucket: () => { throw new Error("not used"); } }));

const company = { ...defaultCompany, abn: "51 824 753 556", address: "Canberra ACT", bankAccountName: "LITA CONSTRUCTION PTY LTD", bsb: "062-000", bankAccountNumber: "12345678", verified: true };
function version(count: number, description: string, adjustment: InvoiceVersion["adjustment"] = null): InvoiceVersion {
  const items = Array.from({ length: count }, (_, i) => ({ description: `${i + 1}. ${description}`, quantity: "12.5", unit: "m²" as const, unitPrice: "85.50" }));
  return {
    version: adjustment ? 2 : 1, number: "LITA-2026-0001", company, totals: calculateTotals(items), createdAt: "2026-09-27T00:00:00.000Z",
    reason: adjustment ? "Corrected area" : "Original issue", templateVersion: 1, void: false, adjustment,
    input: { customer: { name: "O'Brien & Sons \"Builders\"", email: "", phone: "", billingAddress: "10 Smith St, Braddon ACT 2612", abn: "" }, siteAddress: "Unit 3/45 Example Rd, Gungahlin ACT", date: "2026-09-27", dueDate: "2026-10-04", purchaseOrder: "PO#123", notes: "Thanks for your business.", items },
  };
}
const pages = async (buffer: Buffer) => (await PDFDocument.load(buffer)).getPageCount();

describe("invoice PDF", () => {
  it("renders a single-page tax invoice with special characters", async () => {
    expect(await pages(await generateInvoicePdf(version(3, "Supply & install 600×600 tiles, 2\u20133 mm joints (grout: Mapei)")))).toBe(1);
  }, 20_000);
  it("paginates long invoices instead of shrinking text", async () => {
    expect(await pages(await generateInvoicePdf(version(40, "Waterproofing to shower recess including membrane, bond breaker and flood test. ".repeat(3))))).toBeGreaterThan(2);
  }, 20_000);
  it("renders an adjustment note only when the amount changed", async () => {
    const adjusted = version(2, "Tiling", { previousVersion: 1, previousTotal: 300000, previousGst: 27273, deltaTotal: -50000, deltaGst: -4545, reason: "Corrected area" });
    expect(await pages(await generateInvoicePdf(adjusted, "adjustment"))).toBe(1);
    await expect(generateInvoicePdf(version(1, "Tiling"), "adjustment")).rejects.toThrow();
  }, 20_000);
});

describe("draft PDF", () => {
  it("still renders incomplete drafts that contain Chinese text", async () => {
    const draft = version(1, "铺砖 Tiling");
    expect(await pages(await generateInvoicePdf({ ...draft, number: "DRAFT", version: 0 }, "invoice", true))).toBe(1);
  }, 20_000);
});

describe("multi-line addresses", () => {
  it("renders English addresses containing line breaks", async () => {
    const v = version(1, "Tiling");
    expect(await pages(await generateInvoicePdf({ ...v, company: { ...v.company, address: "55 Blackman Cres\nMacquarie ACT 2614" } }))).toBe(1);
  }, 20_000);
});

describe("archived PDF", () => {
  it("serves a snapshot render when storage is unavailable, but reports it in strict mode", async () => {
    const v = version(2, "Tiling");
    expect(await pages(await archivedPdf("invoice-id", v, "invoice"))).toBe(1);
    await expect(archivedPdf("invoice-id", v, "invoice", true)).rejects.toThrow();
  }, 20_000);
});
