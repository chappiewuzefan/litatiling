import { createHash } from "node:crypto";
import type { DocumentReference, Firestore, Transaction } from "firebase-admin/firestore";
import { z } from "zod";
import { calculateTotals, cents, companySchema, customerSchema, defaultCompany, defaultPresets, draftSchema, englishReason, InvoiceError, cleanNumber, normalizeInput, presetSchema, sydneyDate, templateVersion, validDate, validateCompany, validateIssue, type Company, type InvoiceRecord, type InvoiceVersion, type Payment } from "./domain";

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
  private catalogMarker() { return this.db.collection("invoiceSettings").doc("catalog"); }
  async catalog(kind: "customers" | "items") {
    const result = await this.db.collection(kind === "customers" ? "invoiceCustomers" : "invoiceItems").orderBy("updatedAt", "desc").get();
    const rows = result.docs.map(d => ({ ...d.data(), id: d.id }));
    if (kind === "customers" || (await this.catalogMarker().get()).data()?.itemsSeeded) return rows;
    // Until the first preset change, built-in presets are shown virtually alongside any stored ones.
    const stored = new Set(rows.map(r => r.id));
    return [...rows, ...defaultPresets.map((p, i) => ({ ...p, id: `default-${i}`, version: 0 })).filter(p => !stored.has(p.id))];
  }
  async saveCatalog(kind: "customers" | "items", id: string, input: unknown, version: number) {
    let data: Record<string, unknown> = (kind === "customers" ? customerSchema : presetSchema).parse(input);
    if (kind === "customers" && !data.name) throw new InvoiceError("请输入客户名称");
    if (kind === "items") data = { ...data, quantity: cleanNumber(String(data.quantity)), unitPrice: cleanNumber(String(data.unitPrice)) };
    return this.catalogWrite(kind, id, version, (tx, ref) => {
      const result = { ...data, version: version + 1, updatedAt: now() };
      tx.set(ref, result); return { ...result, id };
    });
  }
  async deleteCatalog(kind: "customers" | "items", id: string, version: number) {
    return this.catalogWrite(kind, id, version, (tx, ref) => { tx.delete(ref); return { id }; });
  }
  // Built-in presets are only virtual until the first preset change; seed them all then (once, tracked by a
  // marker) so editing or deleting one never makes the others disappear, and deleting all keeps them deleted.
  private async catalogWrite<T>(kind: "customers" | "items", id: string, version: number, apply: (tx: Transaction, ref: DocumentReference) => T) {
    idSchema.parse(id);
    const collection = this.db.collection(kind === "customers" ? "invoiceCustomers" : "invoiceItems");
    const ref = collection.doc(id), marker = this.catalogMarker();
    return this.db.runTransaction(async tx => {
      const previous = await tx.get(ref);
      const seed = kind === "items" && !(await tx.get(marker)).data()?.itemsSeeded;
      const seeds = seed ? defaultPresets.map((preset, i) => ({ preset, ref: collection.doc(`default-${i}`), id: `default-${i}` })).filter(s => s.id !== id) : [];
      const existing = await Promise.all(seeds.map(s => tx.get(s.ref)));
      if ((previous.data()?.version || 0) !== version) throw new InvoiceError("资料已在其他设备修改，请刷新后再试", 409);
      const seededAt = new Date(0).toISOString();
      seeds.forEach((s, i) => { if (!existing[i].exists) tx.set(s.ref, { ...s.preset, version: 0, updatedAt: seededAt }); });
      if (seed) tx.set(marker, { itemsSeeded: true });
      return apply(tx, ref);
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
        const input = normalizeInput(cmd.input);
        result = { id: cmd.id, input, totals: calculateTotals(input.items), status: "draft", number: null, company: null, version: 0, paidCents: 0, createdAt: existing?.createdAt || timestamp, updatedAt: timestamp, lockVersion: cmd.expectedVersion + 1 };
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
            const input = normalizeInput(cmd.input);
            validateIssue(input, existing.company);
            result = { ...result, input, totals: calculateTotals(input.items), version: existing.version + 1 };
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
