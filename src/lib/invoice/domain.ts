import Decimal from "decimal.js";
import { z } from "zod";

export class InvoiceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const text = (max = 200) => z.string().trim().max(max);
// Half-typed numbers such as "12." or ".5" are valid drafts; they are normalised when saved.
const decimalInput = z.string().regex(/^(?:\d{0,8}(?:\.\d{0,4})?)?$/, "数量最多四位小数");
const moneyInput = z.string().regex(/^(?:\d{0,8}(?:\.\d{0,2})?)?$/, "单价最多两位小数");
export const customerSchema = z.object({
  // Email is not printed on invoices; accept half-typed values so autosave never blocks on it.
  name: text(), email: text(200), phone: text(50),
  billingAddress: text(500), abn: text(30),
}).strict();
export const itemSchema = z.object({
  description: text(1000), quantity: decimalInput, unit: z.enum(["m²", "m", "each", "job", "hour", "day"]), unitPrice: moneyInput,
}).strict();
export const draftSchema = z.object({
  customer: customerSchema, siteAddress: text(500), date: text(10), dueDate: text(10),
  purchaseOrder: text(100), notes: text(1500), items: z.array(itemSchema).min(1).max(100),
}).strict();
export const companySchema = z.object({
  name: text(), abn: text(30), address: text(500), email: text(), phone: text(50),
  bankAccountName: text(), bsb: text(10), bankAccountNumber: text(20),
  // defaultTermsDays is no longer edited in the UI; keep accepting stored values but do not require it.
  gstRegistered: z.boolean(), verified: z.boolean(), defaultTermsDays: z.number().int().min(0).max(90).default(7),
}).strict();
export const presetSchema = z.object({ label: text(100).min(1), ...itemSchema.shape }).strict();
export type Customer = z.infer<typeof customerSchema>;
export type InvoiceItem = z.infer<typeof itemSchema>;
export type InvoiceInput = z.infer<typeof draftSchema>;
export type Company = z.infer<typeof companySchema>;
export type Preset = z.infer<typeof presetSchema>;
export type Totals = { lines: number[]; subtotal: number; gst: number; total: number };
export type Payment = { id: string; cents: number; date: string; method: string; note: string; createdAt: string; reversedAt?: string; reversalReason?: string };
export type InvoiceRecord = {
  id: string; input: InvoiceInput; company: Company | null; totals: Totals; number: string | null;
  status: "draft" | "issued" | "void"; version: number; lockVersion: number;
  paidCents: number; createdAt: string; updatedAt: string; voidReason?: string;
  // Deleted drafts are hidden everywhere but kept with their event trail; issued invoices are voided instead.
  deletedAt?: string;
};
export type InvoiceVersion = {
  version: number; number: string; input: InvoiceInput; company: Company; totals: Totals;
  createdAt: string; reason: string; templateVersion: 1 | 2; void: boolean;
  adjustment: null | { previousVersion: number; previousTotal: number; previousGst: number; deltaTotal: number; deltaGst: number; reason: string };
};
export const emptyCustomer: Customer = { name: "", email: "", phone: "", billingAddress: "", abn: "" };
export const defaultCompany: Company = {
  name: "LITA CONTRACTION PTY LTD", abn: "", address: "", email: "litamia810@gmail.com", phone: "0435 248 809",
  bankAccountName: "", bsb: "", bankAccountNumber: "", gstRegistered: true, verified: false, defaultTermsDays: 7,
};
export const defaultPresets: Preset[] = [
  ["防水", "Waterproofing", "job"], ["铺砖", "Tiling", "m²"], ["找平", "Floor bedding", "m²"],
  ["厨房挡水墙砖", "Splashback tiling", "m²"], ["窗边 / 门边 / 壁龛", "Tiling to windows, doorways and niches", "each"],
].map(([label, description, unit]) => ({ label, description, unit: unit as InvoiceItem["unit"], quantity: "1", unitPrice: "" }));

export function sydneyDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
}
// The payment due date is optional and starts empty.
export function blankInvoice(): InvoiceInput {
  const date = sydneyDate();
  return { customer: { ...emptyCustomer }, siteAddress: "", date, dueDate: "", purchaseOrder: "", notes: "", items: [{ description: "", quantity: "1", unit: "job", unitPrice: "" }] };
}
const numeric = (value: string) => { const v = value.replace(/\.$/, ""); return v && v !== "." ? v : "0"; };
export function cleanNumber(value: string) { const v = value.replace(/\.$/, ""); return v.startsWith(".") ? `0${v}` : v; }
// Keeps only digits and the first decimal point, so pasted "$1,200.50" becomes "1200.50".
export function numberInput(value: string, decimals = 4) { const [whole, ...rest] = value.replace(/[^\d.]/g, "").split("."); return (rest.length ? `${whole.slice(0, 8)}.${rest.join("").slice(0, decimals)}` : whole.slice(0, 8)); }
export function normalizeInput(input: InvoiceInput): InvoiceInput {
  return { ...input, items: input.items.map(i => ({ ...i, quantity: cleanNumber(i.quantity), unitPrice: cleanNumber(i.unitPrice) })) };
}
export function cents(value: string) { return new Decimal(numeric(value)).mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber(); }
export function calculateTotals(items: InvoiceItem[]): Totals {
  const lines = items.map(i => new Decimal(numeric(i.quantity)).mul(numeric(i.unitPrice)).mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber());
  const subtotal = lines.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal > 1e12) throw new InvoiceError("发票金额超出支持范围");
  const gst = new Decimal(subtotal).mul("0.1").toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
  return { lines, subtotal, gst, total: subtotal + gst };
}
export const templateVersion = 2 as const;
const digits = (value: string) => value.replace(/\D/g, "");
export function formatDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : value; }
export function formatAbn(value: string) { const d = digits(value); return d.length === 11 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : value; }
export function formatBsb(value: string) { const d = digits(value); return d.length === 6 ? `${d.slice(0, 3)}-${d.slice(3)}` : value; }
export const aud = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value / 100);
export function isValidAbn(value: string) {
  const digits = value.replace(/\s/g, "");
  if (!/^\d{11}$/.test(digits)) return false;
  return digits.split("").reduce((sum, d, i) => sum + (Number(d) - (i === 0 ? 1 : 0)) * [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19][i], 0) % 89 === 0;
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
// Invoice-facing text is entered in English; UI labels and internal notes remain Chinese.
export function nonEnglish(value: string) { return /[^\u0020-\u024f\n\r\t\u2000-\u206f]/u.test(value); }
function requireEnglish(value: string, label: string) {
  if (nonEnglish(value)) throw new InvoiceError(`${label}请填写英文（导出文件使用英文）`);
}
const companyLabels: Partial<Record<keyof Company, string>> = { name: "公司名称", abn: "ABN", address: "公司地址", email: "邮箱", phone: "电话", bankAccountName: "账户名称", bsb: "BSB", bankAccountNumber: "账号" };
export function companyProblems(company: Company) {
  const problems: string[] = [];
  if (!company.verified || !company.gstRegistered) problems.push("请先在设置中核实公司资料并确认 GST 登记");
  if (!company.name || !isValidAbn(company.abn) || !company.bankAccountName || !/^\d{3}-?\d{3}$/.test(company.bsb) || !/^\d{5,12}$/.test(company.bankAccountNumber)) problems.push("请检查公司名称、ABN、银行账户名称、BSB 和账号");
  for (const [key, label] of Object.entries(companyLabels)) if (nonEnglish(String(company[key as keyof Company] ?? ""))) problems.push(`${label}请填写英文（导出文件使用英文）`);
  return problems;
}
export function validateCompany(company: Company) {
  const [problem] = companyProblems(company);
  if (problem) throw new InvoiceError(problem);
}
// Every reason an invoice cannot be issued yet, so the editor can list them all at once.
export function issueProblems(input: InvoiceInput, company: Company) {
  const problems = companyProblems(company);
  if (!validDate(input.date)) problems.push("请检查开票日期");
  if (input.dueDate && (!validDate(input.dueDate) || input.dueDate < input.date)) problems.push("付款到期日不能早于开票日期");
  if (input.customer.abn && !isValidAbn(input.customer.abn)) problems.push("客户 ABN 格式不正确");
  input.items.forEach((i, n) => {
    if (!i.description.trim() || new Decimal(numeric(i.quantity)).lte(0) || cleanNumber(i.unitPrice) === "") problems.push(`项目 ${n + 1}：请完善英文描述、数量和单价`);
  });
  let total = 0;
  try { total = calculateTotals(input.items).total; } catch (error) { problems.push((error as Error).message); }
  if (total <= 0 && !problems.some(p => p.startsWith("项目"))) problems.push("发票总额必须大于零");
  // ATO: a tax invoice of A$1,000 or more must show the buyer's identity or ABN.
  if (total >= 100000 && !input.customer.name.trim() && !input.customer.abn.trim()) problems.push("A$1,000 及以上的发票必须填写客户名称或客户 ABN");
  if (!input.customer.name.trim() && !input.customer.billingAddress.trim() && !input.siteAddress.trim()) problems.push("请至少填写客户名称、账单地址或施工地址");
  if ([input.customer.name, input.customer.billingAddress, input.siteAddress, input.purchaseOrder, input.notes, ...input.items.map(i => i.description)].some(nonEnglish)) problems.push("发票内容请填写英文（导出文件使用英文）");
  return problems;
}
export function validateIssue(input: InvoiceInput, company: Company) {
  const [problem] = issueProblems(input, company);
  if (problem) throw new InvoiceError(problem);
}
export function englishReason(reason: string) {
  if (!reason.trim() || reason.length > 500) throw new InvoiceError("请输入更正原因（最多 500 字符）");
  requireEnglish(reason, "更正原因"); return reason.trim();
}
export function paymentState(invoice: Pick<InvoiceRecord, "totals" | "paidCents" | "status"> & { input?: Pick<InvoiceInput, "dueDate"> }, today = sydneyDate()) {
  const due = invoice.status === "void" ? 0 : invoice.totals.total;
  const balance = due - invoice.paidCents;
  const dueDate = invoice.input?.dueDate;
  return { balance, status: balance < 0 ? "overpaid" : balance === 0 ? "paid" : invoice.paidCents > 0 ? "partial" : "unpaid", overdue: invoice.status === "issued" && balance > 0 && !!dueDate && dueDate < today };
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[=+@\-\t\r\n]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
