import { createHash } from "node:crypto";
import type { Firestore, Transaction } from "firebase-admin/firestore";
import { z } from "zod";
import { calculateTotals, cents, companySchema, customerSchema, defaultCompany, defaultPresets, draftSchema, englishReason, InvoiceError, presetSchema, sydneyDate, templateVersion, validDate, validateCompany, validateIssue, type Company, type InvoiceRecord, type InvoiceVersion, type Payment } from "./domain";

const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{8,100}$/);
const lockSchema = z.number().int().min(0);
const commandBase = { id: idSchema, operationId: idSchema, expectedVersion: lockSchema };
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), ...commandBase, input: draftSchema }),
  z.object({ action: z.literal("issue"), ...commandBase }),
  z.object({ action: z.literal("revise"), ...commandBase, input: draftSchema, reason: z.string().min(1).max(500) }),
  z.object({ action: z.literal("void"), ...commandBase, reason: z.string().min(1).max(500) }),
  z.object({ action: z.literal("payment"), ...commandBase, amount: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/), date: z.string(), method: z.enum(["Bank transfer", "Cash", "Other"]), note: z.string().max(500) }),
  z.object({ action: z.literal("reverse-payment"), ...commandBase, paymentId: idSchema, reason: z.string().min(1).max(500) }),
  z.object({ action: z.literal("delete-draft"), ...commandBase }),
]);
export type InvoiceCommand = z.infer<typeof commandSchema>;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const now = () => new Date().toISOString();

export class InvoiceStore {
  constructor(private db: Firestore) {}
  private records() { return this.db.collection("invoiceRecords"); }
  async settings() {
    const doc = await this.db.collection("invoiceSettings").doc("company").get();
    return doc.exists ? doc.data() as { company: Company; version: number } : { company: defaultCompany, version: 0 };
  }
  async saveSettings(input: unknown, version: number) {
    const company = companySchema.parse(input);
    if (company.verified) validateCompany(company);
    const ref = this.db.collection("invoiceSettings").doc("company");
    return this.db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if ((existing.data()?.version || 0) !== version) throw new InvoiceError("设置已在其他设备修改，请刷新", 409);
      const result = { company, version: version + 1 };
      tx.set(ref, result); return result;
    });
  }
  async catalog(kind: "customers" | "items") {
    const result = await this.db.collection(kind === "customers" ? "invoiceCustomers" : "invoiceItems").orderBy("updatedAt", "desc").get();
    if (kind === "items" && result.empty) return defaultPresets.map((p, i) => ({ ...p, id: `default-${i}`, version: 0 }));
    return result.docs.map(d => ({ ...d.data(), id: d.id }));
  }
  async saveCatalog(kind: "customers" | "items", id: string, input: unknown, version: number) {
    idSchema.parse(id);
    const data = (kind === "customers" ? customerSchema : presetSchema).parse(input);
    if (kind === "customers" && !(data as { name: string }).name) throw new InvoiceError("请输入客户名称");
    const ref = this.db.collection(kind === "customers" ? "invoiceCustomers" : "invoiceItems").doc(id);
    return this.db.runTransaction(async tx => {
      const previous = await tx.get(ref);
      if ((previous.data()?.version || 0) !== version) throw new InvoiceError("资料已修改，请刷新", 409);
      const result = { ...data, version: version + 1, updatedAt: now() };
      tx.set(ref, result); return { ...result, id };
    });
  }
  async list() {
    // Small internal ledger: search/CSV operate on the complete ledger, never a silently truncated page.
    const result = await this.records().orderBy("updatedAt", "desc").get();
    return result.docs.map(d => d.data() as InvoiceRecord).filter(r => !r.deletedAt);
  }
  async detail(id: string) {
    idSchema.parse(id);
    const ref = this.records().doc(id);
    const [doc, versions, payments] = await Promise.all([ref.get(), ref.collection("versions").orderBy("version", "desc").get(), ref.collection("payments").orderBy("createdAt", "desc").get()]);
    if (!doc.exists || (doc.data() as InvoiceRecord).deletedAt) throw new InvoiceError("发票不存在或草稿已删除", 404);
    return { invoice: doc.data() as InvoiceRecord, versions: versions.docs.map(d => d.data() as InvoiceVersion), payments: payments.docs.map(d => d.data() as Payment) };
  }
  async getVersion(id: string, version: number) {
    idSchema.parse(id);
    if (!Number.isInteger(version) || version < 1) throw new InvoiceError("版本不正确");
    const doc = await this.records().doc(id).collection("versions").doc(String(version)).get();
    if (!doc.exists) throw new InvoiceError("版本不存在", 404);
    return doc.data() as InvoiceVersion;
  }
  async command(raw: unknown, uid: string) {
    const cmd = commandSchema.parse(raw);
    const ref = this.records().doc(cmd.id);
    const opRef = this.db.collection("invoiceOperations").doc(cmd.operationId);
    const fingerprint = hash(cmd);
    return this.db.runTransaction(async (tx: Transaction) => {
      const op = await tx.get(opRef);
      if (op.exists) {
        if (op.data()?.fingerprint !== fingerprint) throw new InvoiceError("重复请求的内容不一致", 409);
        return op.data()?.result as InvoiceRecord;
      }
      const doc = await tx.get(ref);
      const existing = doc.exists ? doc.data() as InvoiceRecord : null;
      if (existing?.deletedAt) throw new InvoiceError("这张草稿已删除", 409);
      if ((existing?.lockVersion || 0) !== cmd.expectedVersion) throw new InvoiceError("这张发票已在其他设备修改。请重新打开后再编辑。", 409);
      const timestamp = now();
      let result: InvoiceRecord;
      let version: InvoiceVersion | null = null;
      if (cmd.action === "save") {
        if (existing && existing.status !== "draft") throw new InvoiceError("已开票请使用更正功能", 409);
        result = { id: cmd.id, input: cmd.input, totals: calculateTotals(cmd.input.items), status: "draft", number: null, company: null, version: 0, paidCents: 0, createdAt: existing?.createdAt || timestamp, updatedAt: timestamp, lockVersion: cmd.expectedVersion + 1 };
      } else {
        if (!existing) throw new InvoiceError("请先保存草稿", 404);
        result = { ...existing, updatedAt: timestamp, lockVersion: existing.lockVersion + 1 };
        if (cmd.action === "issue") {
          if (existing.status !== "draft") throw new InvoiceError("这张发票已经开出", 409);
          const settings = await tx.get(this.db.collection("invoiceSettings").doc("company"));
          const company = companySchema.parse(settings.data()?.company || defaultCompany);
          validateIssue(existing.input, company);
          // Numbering follows actual issuance year in Sydney, independent of an editable invoice date.
          const year = sydneyDate().slice(0, 4);
          const counter = this.db.collection("invoiceCounters").doc(year);
          const counterDoc = await tx.get(counter);
          const next = (counterDoc.data()?.value || 0) + 1;
          result = { ...result, company, number: `LITA-${year}-${String(next).padStart(4, "0")}`, status: "issued", version: 1, totals: calculateTotals(existing.input.items) };
          tx.set(counter, { value: next });
        } else if (cmd.action === "revise" || cmd.action === "void") {
          if (existing.status !== "issued" || !existing.company) throw new InvoiceError("只有已开票的发票可以更正或作废", 409);
          const reason = englishReason(cmd.reason);
          if (cmd.action === "revise") {
            validateIssue(cmd.input, existing.company);
            result = { ...result, input: cmd.input, totals: calculateTotals(cmd.input.items), version: existing.version + 1 };
          } else result = { ...result, status: "void", version: existing.version + 1, voidReason: reason };
          const targetTotal = cmd.action === "void" ? 0 : result.totals.total;
          const targetGst = cmd.action === "void" ? 0 : result.totals.gst;
          version = {
            version: result.version, number: result.number!, input: result.input, company: existing.company, totals: result.totals, createdAt: timestamp, reason, templateVersion, void: result.status === "void",
            adjustment: targetTotal !== existing.totals.total || targetGst !== existing.totals.gst ? { previousVersion: existing.version, previousTotal: existing.totals.total, previousGst: existing.totals.gst, deltaTotal: targetTotal - existing.totals.total, deltaGst: targetGst - existing.totals.gst, reason } : null,
          };
        } else if (cmd.action === "payment") {
          if (existing.status !== "issued") throw new InvoiceError("仅已开票的发票可以登记收款");
          const amount = cents(cmd.amount);
          if (amount <= 0 || !validDate(cmd.date)) throw new InvoiceError("请检查收款金额和日期");
          const payment: Payment = { id: cmd.operationId, cents: amount, date: cmd.date, method: cmd.method, note: cmd.note, createdAt: timestamp };
          tx.create(ref.collection("payments").doc(cmd.operationId), payment);
          result.paidCents += amount;
        } else if (cmd.action === "delete-draft") {
          if (existing.status !== "draft") throw new InvoiceError("只有草稿可以删除；已开票的发票请使用作废", 409);
          result.deletedAt = timestamp;
        } else if (cmd.action === "reverse-payment") {
          const pRef = ref.collection("payments").doc(cmd.paymentId);
          const pDoc = await tx.get(pRef);
          const payment = pDoc.data() as Payment | undefined;
          if (!payment || payment.reversedAt) throw new InvoiceError("收款记录不存在或已经撤销", 409);
          tx.update(pRef, { reversedAt: timestamp, reversalReason: cmd.reason });
          result.paidCents -= payment.cents;
        }
        if (cmd.action === "issue") version = { version: 1, number: result.number!, input: result.input, company: result.company!, totals: result.totals, createdAt: timestamp, reason: "Original issue", templateVersion, void: false, adjustment: null };
      }
      if (version) tx.create(ref.collection("versions").doc(String(version.version)), version);
      tx.set(ref, result);
      tx.create(ref.collection("events").doc(cmd.operationId), { action: cmd.action, uid, at: timestamp, lockVersion: result.lockVersion, reason: "reason" in cmd ? cmd.reason : "" });
      tx.create(opRef, { fingerprint, result, createdAt: timestamp });
      return result;
    });
  }
}
