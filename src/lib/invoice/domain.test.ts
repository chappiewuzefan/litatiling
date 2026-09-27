import { describe, expect, it } from "vitest";
import { addDays, calculateTotals, cleanNumber, csvCell, defaultCompany, englishReason, isValidAbn, issueProblems, numberInput, paymentState, validateIssue, validDate, type InvoiceInput } from "./domain";

const item = (quantity: string, unitPrice: string) => ({ description: "Tiling", quantity, unit: "m²" as const, unitPrice });
const company = { ...defaultCompany, abn: "51 824 753 556", address: "Canberra ACT", bankAccountName: "LITA CONSTRUCTION PTY LTD", bsb: "062-000", bankAccountNumber: "12345678", verified: true };
const input = (patch: Partial<InvoiceInput> = {}): InvoiceInput => ({
  customer: { name: "Jane Smith", email: "", phone: "", billingAddress: "", abn: "" },
  siteAddress: "1 Example St, Belconnen ACT", date: "2026-09-27", dueDate: "2026-10-04", purchaseOrder: "", notes: "",
  items: [item("1", "100")], ...patch,
});

describe("invoice totals", () => {
  it("adds 10% GST to the excluding-GST subtotal", () => {
    expect(calculateTotals([item("1", "11450")])).toEqual({ lines: [1145000], subtotal: 1145000, gst: 114500, total: 1259500 });
  });
  it("rounds each line to cents before summing, then rounds GST once", () => {
    // 1.333 × 10.00 = 13.33; 2.5 × 3.33 = 8.325 → 8.33
    const totals = calculateTotals([item("1.333", "10"), item("2.5", "3.33")]);
    expect(totals.lines).toEqual([1333, 833]);
    expect(totals.subtotal).toBe(2166);
    expect(totals.gst).toBe(217); // 216.6 → 217
    expect(totals.total).toBe(2383);
  });
  it("avoids binary floating point drift", () => {
    expect(calculateTotals([item("3", "0.1"), item("1", "0.2")]).subtotal).toBe(50);
  });
});

describe("payment state", () => {
  const issued = (paidCents: number) => ({ status: "issued" as const, totals: calculateTotals([item("1", "100")]), paidCents });
  it("tracks unpaid, partial, paid and overpaid balances", () => {
    expect(paymentState(issued(0))).toEqual({ status: "unpaid", balance: 11000, overdue: false });
    expect(paymentState(issued(5000))).toMatchObject({ status: "partial", balance: 6000 });
    expect(paymentState(issued(11000))).toMatchObject({ status: "paid", balance: 0 });
    expect(paymentState(issued(12000))).toMatchObject({ status: "overpaid", balance: -1000 });
  });
  it("marks overdue only when an optional due date has passed", () => {
    const withDue = (paidCents: number, dueDate: string) => ({ ...issued(paidCents), input: { dueDate } });
    expect(paymentState(issued(0)).overdue).toBe(false);
    expect(paymentState(withDue(0, ""), "2026-09-27").overdue).toBe(false);
    expect(paymentState(withDue(5000, "2026-09-26"), "2026-09-27").overdue).toBe(true);
    expect(paymentState(withDue(11000, "2026-09-26"), "2026-09-27").overdue).toBe(false);
  });
});

describe("issue validation", () => {
  it("accepts a complete English invoice", () => {
    expect(() => validateIssue(input(), company)).not.toThrow();
  });
  it("requires verified company details", () => {
    expect(() => validateIssue(input(), { ...company, verified: false })).toThrow(/核实/);
  });
  it("requires the buyer's name or ABN only from A$1,000 (ATO rule)", () => {
    const noName = { ...input().customer, name: "" };
    expect(() => validateIssue(input({ customer: noName }), company)).not.toThrow();
    expect(() => validateIssue(input({ customer: noName, items: [item("1", "1000")] }), company)).toThrow(/1,000/);
    expect(() => validateIssue(input({ customer: { ...noName, abn: "51 824 753 556" }, items: [item("1", "1000")] }), company)).not.toThrow();
    expect(() => validateIssue(input({ customer: noName, siteAddress: "" }), company)).toThrow(/地址/);
  });
  it("rejects Chinese text on the English document", () => {
    expect(() => validateIssue(input({ items: [{ ...item("1", "100"), description: "铺砖" }] }), company)).toThrow(/英文/);
    expect(() => englishReason("数量错误")).toThrow(/英文/);
  });
  it("rejects invalid dates, zero quantities and customer ABNs", () => {
    expect(() => validateIssue(input({ date: "2026-02-30" }), company)).toThrow(/日期/);
    expect(() => validateIssue(input({ dueDate: "" }), company)).not.toThrow();
    expect(() => validateIssue(input({ dueDate: "2026-09-01" }), company)).toThrow(/到期/);
    expect(() => validateIssue(input({ items: [item("0", "100")] }), company)).toThrow();
    expect(() => validateIssue(input({ customer: { ...input().customer, abn: "12345678901" } }), company)).toThrow(/ABN/);
  });
});

describe("helpers", () => {
  it("validates ABN checksums", () => {
    expect(isValidAbn("51 824 753 556")).toBe(true);
    expect(isValidAbn("51 824 753 557")).toBe(false);
  });
  it("validates calendar dates and adds days across months", () => {
    expect(validDate("2026-02-29")).toBe(false);
    expect(addDays("2026-09-27", 7)).toBe("2026-10-04");
  });
  it("neutralises spreadsheet formulas in CSV", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell("Smith, Jane")).toBe('"Smith, Jane"');
  });
  it("cleans typed and pasted numbers", () => {
    expect(numberInput("$1,200.50")).toBe("1200.50");
    expect(numberInput("12.5.3")).toBe("12.53");
    expect(cleanNumber("12.")).toBe("12");
    expect(cleanNumber(".5")).toBe("0.5");
    expect(calculateTotals([item("12.", "10")]).subtotal).toBe(12000);
    expect(calculateTotals([item(".", "")]).subtotal).toBe(0);
  });
  it("lists every issue problem at once", () => {
    const problems = issueProblems(input({ items: [item("1", ""), { ...item("2", "5"), description: "铺砖" }], siteAddress: "", customer: { ...input().customer, name: "" } }), { ...company, verified: false });
    expect(problems.some(p => p.includes("核实"))).toBe(true);
    expect(problems.some(p => p.startsWith("项目 1"))).toBe(true);
    expect(problems.some(p => p.includes("地址"))).toBe(true);
    expect(problems.some(p => p.includes("英文"))).toBe(true);
    expect(issueProblems(input(), company)).toEqual([]);
  });
  it("allows zero-priced lines but not blank prices", () => {
    expect(issueProblems(input({ items: [item("1", "100"), { ...item("1", "0"), description: "Included at no charge" }] }), company)).toEqual([]);
    expect(issueProblems(input({ items: [item("1", "100"), item("1", "")] }), company).some(p => p.startsWith("项目 2"))).toBe(true);
    expect(numberInput("12.3456", 2)).toBe("12.34");
  });
});
