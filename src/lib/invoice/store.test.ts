import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { defaultCompany, sydneyDate, type InvoiceInput } from "./domain";
import { InvoiceStore } from "./store";

// Minimal serializable Firestore stand-in: transactions run one at a time and commit atomically.
class FakeDb {
  docs = new Map<string, Record<string, unknown>>();
  private queue: Promise<unknown> = Promise.resolve();
  private snap(path: string) {
    const value = this.docs.get(path);
    return { id: path.split("/").pop()!, exists: !!value, data: () => (value ? structuredClone(value) : undefined) };
  }
  private doc(path: string): Record<string, unknown> {
    return { path, get: async () => this.snap(path), collection: (name: string) => this.collection(`${path}/${name}`) };
  }
  collection(path: string) {
    const depth = path.split("/").length + 1;
    const query = (field: string, direction = "asc") => ({
      get: async () => {
        const docs = [...this.docs.keys()].filter(k => k.startsWith(`${path}/`) && k.split("/").length === depth).map(k => this.snap(k))
          .sort((a, b) => (String(a.data()![field]) < String(b.data()![field]) ? -1 : 1) * (direction === "desc" ? -1 : 1));
        return { empty: !docs.length, docs };
      },
    });
    return { doc: (id: string) => this.doc(`${path}/${id}`), orderBy: query };
  }
  runTransaction<T>(fn: (tx: unknown) => Promise<T>) {
    const run = async () => {
      const writes: [string, "set" | "create" | "update" | "delete", Record<string, unknown>][] = [];
      const tx = {
        get: async (ref: { path: string }) => this.snap(ref.path),
        set: (ref: { path: string }, v: Record<string, unknown>) => writes.push([ref.path, "set", v]),
        create: (ref: { path: string }, v: Record<string, unknown>) => writes.push([ref.path, "create", v]),
        update: (ref: { path: string }, v: Record<string, unknown>) => writes.push([ref.path, "update", v]),
        delete: (ref: { path: string }) => writes.push([ref.path, "delete", {}]),
      };
      const result = await fn(tx);
      for (const [path, kind] of writes) if (kind === "create" && this.docs.has(path)) throw new Error(`ALREADY_EXISTS ${path}`);
      for (const [path, kind, v] of writes) if (kind === "delete") this.docs.delete(path); else this.docs.set(path, structuredClone(kind === "update" ? { ...this.docs.get(path), ...v } : v));
      return result;
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => {});
    return next;
  }
}

const company = { ...defaultCompany, abn: "51 824 753 556", address: "Canberra ACT", bankAccountName: "LITA CONSTRUCTION PTY LTD", bsb: "062-000", bankAccountNumber: "12345678", verified: true };
const input = (price = "11450"): InvoiceInput => ({
  customer: { name: "Jane Smith", email: "", phone: "", billingAddress: "", abn: "" }, siteAddress: "1 Example St", date: "2026-09-27", dueDate: "2026-10-04",
  purchaseOrder: "", notes: "", items: [{ description: "Tiling", quantity: "1", unit: "job", unitPrice: price }],
});
let db: FakeDb, store: InvoiceStore, op = 0;
const opId = () => `operation-${++op}`;
async function draft(id: string, price?: string) {
  return store.command({ action: "save", id, operationId: opId(), expectedVersion: 0, input: input(price) }, "uid");
}

beforeEach(async () => {
  db = new FakeDb(); store = new InvoiceStore(db as unknown as Firestore);
  await store.saveSettings(company, 0);
});

describe("invoice store", () => {
  it("issues sequential numbers without duplicates under concurrency", async () => {
    const ids = Array.from({ length: 5 }, (_, i) => `invoice-${i}000`);
    const drafts = await Promise.all(ids.map(id => draft(id)));
    const issued = await Promise.all(drafts.map(d => store.command({ action: "issue", id: d.id, operationId: opId(), expectedVersion: d.lockVersion }, "uid")));
    const year = sydneyDate().slice(0, 4);
    expect(issued.map(i => i.number).sort()).toEqual([1, 2, 3, 4, 5].map(n => `LITA-${year}-000${n}`));
    expect(issued[0].totals).toMatchObject({ subtotal: 1145000, gst: 114500, total: 1259500 });
  });

  it("replays a repeated issue or payment without a second number or payment", async () => {
    const d = await draft("invoice-repeat");
    const issue = { action: "issue" as const, id: d.id, operationId: opId(), expectedVersion: d.lockVersion };
    const [a, b] = await Promise.all([store.command(issue, "uid"), store.command(issue, "uid")]);
    expect(a.number).toBe(b.number);
    const payment = { action: "payment" as const, id: d.id, operationId: opId(), expectedVersion: a.lockVersion, amount: "5000", date: "2026-09-28", method: "Bank transfer" as const, note: "" };
    await store.command(payment, "uid"); await store.command(payment, "uid");
    const detail = await store.detail(d.id);
    expect(detail.payments).toHaveLength(1);
    expect(detail.invoice.paidCents).toBe(500000);
    await expect(store.command({ ...payment, amount: "6000" }, "uid")).rejects.toThrow(/不一致/);
  });

  it("rejects stale edits instead of overwriting", async () => {
    const d = await draft("invoice-stale");
    await store.command({ action: "save", id: d.id, operationId: opId(), expectedVersion: d.lockVersion, input: input("200") }, "uid");
    await expect(store.command({ action: "save", id: d.id, operationId: opId(), expectedVersion: d.lockVersion, input: input("300") }, "uid")).rejects.toMatchObject({ status: 409 });
  });

  it("keeps the original snapshot and records an adjustment when a revision changes the amount", async () => {
    const d = await draft("invoice-revise", "1000");
    const issued = await store.command({ action: "issue", id: d.id, operationId: opId(), expectedVersion: d.lockVersion }, "uid");
    const paid = await store.command({ action: "payment", id: d.id, operationId: opId(), expectedVersion: issued.lockVersion, amount: "1100", date: "2026-09-28", method: "Cash", note: "" }, "uid");
    await store.saveSettings({ ...company, bankAccountNumber: "99999999" }, 1);
    const revised = await store.command({ action: "revise", id: d.id, operationId: opId(), expectedVersion: paid.lockVersion, input: input("800"), reason: "Reduced area after final measure" }, "uid");
    const v1 = await store.getVersion(d.id, 1), v2 = await store.getVersion(d.id, 2);
    expect(v1.totals.total).toBe(110000);
    expect(v2.company.bankAccountNumber).toBe("12345678");
    expect(v2.adjustment).toMatchObject({ previousTotal: 110000, deltaTotal: -22000, deltaGst: -2000 });
    expect(revised.number).toBe(issued.number);
    expect(revised.paidCents - revised.totals.total).toBe(22000); // overpaid, not refunded
  });

  it("records a reversal and reduces the received amount", async () => {
    const d = await draft("invoice-reverse", "100");
    const issued = await store.command({ action: "issue", id: d.id, operationId: opId(), expectedVersion: d.lockVersion }, "uid");
    const paymentId = opId();
    const paid = await store.command({ action: "payment", id: d.id, operationId: paymentId, expectedVersion: issued.lockVersion, amount: "50", date: "2026-09-28", method: "Cash", note: "" }, "uid");
    const reversed = await store.command({ action: "reverse-payment", id: d.id, operationId: opId(), expectedVersion: paid.lockVersion, paymentId, reason: "Wrong invoice" }, "uid");
    expect(reversed.paidCents).toBe(0);
    expect((await store.detail(d.id)).payments[0].reversedAt).toBeTruthy();
  });

  it("does not allow drafts to be edited after issue", async () => {
    const d = await draft("invoice-locked");
    const issued = await store.command({ action: "issue", id: d.id, operationId: opId(), expectedVersion: d.lockVersion }, "uid");
    await expect(store.command({ action: "save", id: d.id, operationId: opId(), expectedVersion: issued.lockVersion, input: input("1") }, "uid")).rejects.toThrow(/更正/);
  });
  it("deletes drafts only, hiding them from lists and blocking later edits", async () => {
    const d = await draft("invoice-delete");
    const deleted = await store.command({ action: "delete-draft", id: d.id, operationId: opId(), expectedVersion: d.lockVersion }, "uid");
    expect(deleted.deletedAt).toBeTruthy();
    expect((await store.list()).map(r => r.id)).not.toContain(d.id);
    await expect(store.detail(d.id)).rejects.toMatchObject({ status: 404 });
    await expect(store.command({ action: "save", id: d.id, operationId: opId(), expectedVersion: deleted.lockVersion, input: input("1") }, "uid")).rejects.toThrow(/已删除/);

    const kept = await draft("invoice-keep");
    const issued = await store.command({ action: "issue", id: kept.id, operationId: opId(), expectedVersion: kept.lockVersion }, "uid");
    await expect(store.command({ action: "delete-draft", id: kept.id, operationId: opId(), expectedVersion: issued.lockVersion }, "uid")).rejects.toThrow(/作废/);
    expect((await store.list()).map(r => r.id)).toContain(kept.id);
  });
  it("keeps the other built-in presets when one is edited or deleted", async () => {
    const presets = await store.catalog("items") as unknown as { id: string; version: number; label: string }[];
    expect(presets).toHaveLength(5);
    await store.saveCatalog("items", "default-1", { label: "铺砖", description: "Floor tiling", quantity: "1", unit: "m²", unitPrice: "45" }, 0);
    let after = await store.catalog("items") as unknown as { id: string; unitPrice: string }[];
    expect(after).toHaveLength(5);
    expect(after.find(p => p.id === "default-1")?.unitPrice).toBe("45");
    await store.deleteCatalog("items", "default-3", 0);
    after = await store.catalog("items") as unknown as { id: string; unitPrice: string }[];
    expect(after.map(p => p.id).sort()).toEqual(["default-0", "default-1", "default-2", "default-4"]);
  });

  it("normalises half-typed numbers when saving drafts", async () => {
    const saved = await store.command({ action: "save", id: "invoice-numbers", operationId: opId(), expectedVersion: 0, input: { ...input(), items: [{ description: "Tiling", quantity: "12.", unit: "m²", unitPrice: ".5" }] } }, "uid");
    expect(saved.input.items[0]).toMatchObject({ quantity: "12", unitPrice: "0.5" });
    expect(saved.totals.subtotal).toBe(600);
  });
  it("keeps presets deleted after all of them are removed", async () => {
    for (let i = 0; i < 5; i++) await store.deleteCatalog("items", `default-${i}`, 0);
    expect(await store.catalog("items")).toEqual([]);
  });

  it("normalises preset numbers when saving", async () => {
    const saved = await store.saveCatalog("items", "preset-custom-1", { label: "找平", description: "Screed", quantity: "2.", unit: "m²", unitPrice: "." }, 0) as unknown as { quantity: string; unitPrice: string };
    expect(saved).toMatchObject({ quantity: "2", unitPrice: "" });
  });
  it("saves settings submitted without the retired payment terms field", async () => {
    const { defaultTermsDays: _unused, ...withoutTerms } = company; void _unused;
    const saved = await store.saveSettings({ ...withoutTerms, bankAccountName: "LITA CONTRACTION PTY LTD" }, 1);
    expect(saved.company).toMatchObject({ bankAccountName: "LITA CONTRACTION PTY LTD", defaultTermsDays: 7 });
  });
});
