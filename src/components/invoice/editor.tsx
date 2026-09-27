"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Alert, Button, Input, Select, Space, Tag } from "antd";
import { aud, blankInvoice, calculateTotals, formatAbn, formatBsb, formatDate, type Company, type InvoiceInput, type InvoiceRecord } from "@/lib/invoice/domain";
import { api, ApiError, createCommandSender, errorText, uid, type Bootstrap } from "./client";
import { ExportButtons } from "./exports";

export type EditorHandle = { flush: () => Promise<void> };
type Props = { data: Bootstrap; initial?: InvoiceRecord; copy?: InvoiceInput; onDone: (id: string) => void; onReload: () => void; refresh: () => Promise<void> };
export const InvoiceEditor = forwardRef<EditorHandle, Props>(function InvoiceEditor({ data, initial, copy, onDone, onReload, refresh }, ref) {
  const [input, setInput] = useState<InvoiceInput>(() => initial?.input || copy || blankInvoice());
  const [record, setRecord] = useState(initial);
  const [saveState, setSaveState] = useState(initial ? "已保存" : "填写后自动保存");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [conflict, setConflict] = useState(false), [reason, setReason] = useState("");
  const inputRef = useRef(input), recordRef = useRef(record), idRef = useRef(initial?.id || uid());
  // A fresh blank invoice starts as "saved" so leaving it untouched never creates an empty draft; copies still save at once.
  const saved = useRef(initial ? JSON.stringify(initial.input) : copy ? "" : JSON.stringify(input));
  const pending = useRef<Record<string, unknown> | null>(null), flight = useRef<Promise<void> | null>(null), blocked = useRef(false);
  const send = useRef(createCommandSender());
  const revision = initial?.status === "issued";
  const dirtyRevision = revision && JSON.stringify(initial.input) !== JSON.stringify(input);
  const change = (value: InvoiceInput) => { inputRef.current = value; setInput(value); if (!revision) setSaveState("待保存…"); };
  const field = <K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) => change({ ...inputRef.current, [key]: value });
  const flush = useCallback(async () => {
    if (revision) {
      if (JSON.stringify(initial.input) !== JSON.stringify(inputRef.current)) throw new Error("请先提交更正，或点击取消更正");
      return;
    }
    if (blocked.current) throw new Error("请先重新打开服务器上的最新版本");
    if (flight.current) await flight.current;
    if (saved.current === JSON.stringify(inputRef.current) && (recordRef.current || !copy)) return;
    flight.current = (async () => {
      while (saved.current !== JSON.stringify(inputRef.current) || !recordRef.current || pending.current) {
        const command = pending.current || { action: "save", id: idRef.current, expectedVersion: recordRef.current?.lockVersion || 0, input: structuredClone(inputRef.current) };
        pending.current = command; setSaveState("保存中…");
        try {
          const result = await send.current(command);
          recordRef.current = result.invoice; setRecord(result.invoice);
          saved.current = JSON.stringify(command.input); pending.current = null; setSaveState("已保存");
        } catch (e) {
          setSaveState("保存失败");
          if (e instanceof ApiError && e.status === 409) { blocked.current = true; setConflict(true); }
          setError(errorText(e)); throw e;
        }
      }
    })();
    try { await flight.current; } finally { flight.current = null; }
  }, [revision, initial, copy]);
  useImperativeHandle(ref, () => ({ flush }), [flush]);
  useEffect(() => {
    if (revision || conflict || (saveState !== "待保存…" && !copy)) return;
    const timeout = setTimeout(() => { void flush().catch(() => {}); }, 800);
    return () => clearTimeout(timeout);
  }, [input, revision, conflict, copy, flush, saveState]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(inputRef.current) !== saved.current) { event.preventDefault(); }
    };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  async function issue() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!revision) await flush();
      if (!recordRef.current) { setError("请先填写发票内容"); return; }
      const current = recordRef.current;
      const result = await send.current(revision ? { action: "revise", id: current.id, expectedVersion: current.lockVersion, input: inputRef.current, reason } : { action: "issue", id: current.id, expectedVersion: current.lockVersion });
      saved.current = JSON.stringify(inputRef.current);
      onDone(result.invoice.id);
    } catch (e) { setError(errorText(e)); if (e instanceof ApiError && e.status === 409) { blocked.current = true; setConflict(true); } }
    finally { setBusy(false); }
  }
  async function saveCustomer() {
    setBusy(true); setError("");
    try { await api(`customers/${uid()}`, { data: input.customer, version: 0 }); await refresh(); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  const totals = (() => { try { return calculateTotals(input.items); } catch { return { subtotal: 0, gst: 0, total: 0, lines: [] }; } })();
  const updateLine = (i: number, patch: Partial<InvoiceInput["items"][number]>) => field("items", input.items.map((item, n) => n === i ? { ...item, ...patch } : item));
  function move(i: number, direction: number) { const items = [...input.items]; [items[i], items[i + direction]] = [items[i + direction], items[i]]; field("items", items); }
  return <>
    <div className="invoice-section-heading"><div><h1>{revision ? `更正 ${initial.number}` : "新建发票"}</h1><p>填写客户和施工项目，生成英文发票。</p></div><Tag color={saveState === "已保存" ? "green" : "default"}>{revision ? "提交后保留旧版本" : saveState}</Tag></div>
    {error && <Alert className="invoice-alert" type="error" title={error} action={conflict ? <Button onClick={onReload}>重新打开最新版本</Button> : <Button onClick={() => void flush().catch(() => {})}>重试保存</Button>} />}
    {!data.settings.company.verified && <Alert className="invoice-alert" type="warning" title="先在设置中核实公司、GST 和银行资料。现在可以填写并保存草稿。" />}
    <div className="invoice-editor-grid">
      <div className="invoice-form-column">
        <section className="invoice-panel"><h2>客户与工地</h2>
          <label className="invoice-field">选择已有客户<Select allowClear showSearch optionFilterProp="label" placeholder="搜索姓名、公司或最近客户" options={data.customers.map(c => ({ value: c.id, label: c.name }))} onChange={id => { const c = data.customers.find(c => c.id === id); if (c) field("customer", { name: c.name, billingAddress: c.billingAddress, abn: c.abn, email: c.email, phone: c.phone }); }} /></label>
          <div className="invoice-fields"><label className="invoice-field">客户姓名 / 公司名称（英文，A$1,000 以上需填名称或 ABN）<Input value={input.customer.name} maxLength={200} onChange={e => field("customer", { ...input.customer, name: e.target.value })} /></label><label className="invoice-field">客户 ABN（选填）<Input value={input.customer.abn} onChange={e => field("customer", { ...input.customer, abn: e.target.value })} /></label></div>
          <label className="invoice-field">账单地址（英文，选填）<Input value={input.customer.billingAddress} onChange={e => field("customer", { ...input.customer, billingAddress: e.target.value })} /></label>
          <div className="invoice-fields"><label className="invoice-field">客户邮箱（选填）<Input type="email" value={input.customer.email} onChange={e => field("customer", { ...input.customer, email: e.target.value })} /></label><label className="invoice-field">客户电话（选填）<Input type="tel" value={input.customer.phone} onChange={e => field("customer", { ...input.customer, phone: e.target.value })} /></label></div>
          <Button size="small" disabled={busy || !input.customer.name} onClick={() => void saveCustomer()}>保存为常用客户</Button>
          <label className="invoice-field">施工地址（英文）<Input value={input.siteAddress} onChange={e => field("siteAddress", e.target.value)} /></label>
          <div className="invoice-fields"><label className="invoice-field">开票日期<Input type="date" value={input.date} onChange={e => field("date", e.target.value)} /></label><label className="invoice-field">付款到期日（选填）<Input type="date" value={input.dueDate} onChange={e => field("dueDate", e.target.value)} /></label></div>
          <label className="invoice-field">PO / 订单号（选填）<Input value={input.purchaseOrder} onChange={e => field("purchaseOrder", e.target.value)} /></label>
        </section>
        <section className="invoice-panel"><h2>施工项目 <small>单价均不含 GST</small></h2>
          <Select className="invoice-preset-select" showSearch value={null} optionFilterProp="label" placeholder="添加常用项目：防水、铺砖、找平…" options={data.items.map(p => ({ value: p.id, label: `${p.label} / ${p.description}` }))} onChange={id => { const p = data.items.find(p => p.id === id)!; const row = { description: p.description, unit: p.unit, quantity: p.quantity, unitPrice: p.unitPrice }; field("items", input.items.length === 1 && !input.items[0].description ? [row] : [...input.items, row]); }} />
          {input.items.map((item, i) => <div className="invoice-line" key={i}>
            <div className="invoice-line-top"><strong>项目 {i + 1}</strong><Space size={2}><Button size="small" aria-label={`项目 ${i + 1} 上移`} disabled={!i} onClick={() => move(i, -1)}>↑</Button><Button size="small" aria-label={`项目 ${i + 1} 下移`} disabled={i === input.items.length - 1} onClick={() => move(i, 1)}>↓</Button><Button size="small" onClick={() => field("items", [...input.items.slice(0, i + 1), { ...item }, ...input.items.slice(i + 1)])}>复制</Button><Button danger size="small" disabled={input.items.length === 1} onClick={() => field("items", input.items.filter((_, n) => n !== i))}>删除</Button></Space></div>
            <label className="invoice-field">英文施工描述<Input.TextArea autoSize={{ minRows: 1, maxRows: 5 }} maxLength={1000} value={item.description} onChange={e => updateLine(i, { description: e.target.value })} /></label>
            <div className="invoice-line-numbers"><label className="invoice-field">数量<Input inputMode="decimal" value={item.quantity} onChange={e => updateLine(i, { quantity: e.target.value })} /></label><label className="invoice-field">单位<Select value={item.unit} options={["m²", "m", "each", "job", "hour", "day"].map(value => ({ value, label: value }))} onChange={unit => updateLine(i, { unit })} /></label><label className="invoice-field">未税单价 AUD<Input inputMode="decimal" value={item.unitPrice} onChange={e => updateLine(i, { unitPrice: e.target.value })} /></label></div>
            <div className="invoice-line-total">金额 {aud(totals.lines[i] || 0)}</div>
          </div>)}
          <Button block type="dashed" disabled={input.items.length >= 100} onClick={() => field("items", [...input.items, { description: "", quantity: "1", unit: "job", unitPrice: "" }])}>＋ 添加项目</Button>
          <label className="invoice-field">英文备注（显示在发票上，选填）<Input.TextArea value={input.notes} maxLength={1500} onChange={e => field("notes", e.target.value)} /></label>
          {revision && <label className="invoice-field">更正原因（英文，必填）<Input.TextArea value={reason} placeholder="例如：Corrected tiling quantity after final measurement" maxLength={500} onChange={e => setReason(e.target.value)} /></label>}
        </section>
      </div>
      <aside className="invoice-preview-column"><InvoicePaper input={input} company={initial?.company || data.settings.company} number={initial?.number || "DRAFT"} /><p className="invoice-preview-note">内容预览 · 正式 PDF 按 A4 自动分页</p></aside>
    </div>
    <div className="invoice-action-bar"><div><small>含 GST 总额</small><strong>{aud(totals.total)}</strong></div><Space wrap>{revision ? <Button onClick={onReload}>取消更正</Button> : <Button disabled={busy} onClick={() => void flush().catch(() => {})}>保存草稿</Button>}{record && !revision && saveState === "已保存" && <ExportButtons url={`/api/invoice/preview/${record.id}`} name="LITA-DRAFT" label="草稿" />}<Button type="primary" size="large" disabled={conflict || (revision && (!reason || !dirtyRevision))} loading={busy} onClick={() => void issue()}>{revision ? "提交更正并留档" : "正式开票"}</Button></Space></div>
  </>;
});

export function InvoicePaper({ input, company, number }: { input: InvoiceInput; company: Company; number: string }) {
  let totals; try { totals = calculateTotals(input.items); } catch { totals = { lines: [], subtotal: 0, gst: 0, total: 0 }; }
  // Mirrors the PDF template: drafts show no number or payment reference.
  const reference = number === "DRAFT" ? "" : number;
  const { customer } = input;
  const siteAsRecipient = !customer.name && !customer.billingAddress && !customer.abn;
  return <div className="invoice-paper" lang="en-AU">
    <div className="invoice-paper-heading"><div><strong className="invoice-paper-company">{company.name}</strong><p>{company.abn && <>ABN {formatAbn(company.abn)}<br /></>}{company.address && <>{company.address}<br /></>}{[company.email, company.phone].filter(Boolean).join(" · ")}</p></div>
      <div><h2>TAX INVOICE</h2><dl className="invoice-paper-details">{reference && <div><dt>Invoice No.</dt><dd><b>{reference}</b></dd></div>}<div><dt>Date</dt><dd>{formatDate(input.date)}</dd></div>{input.dueDate && <div><dt>Due date</dt><dd>{formatDate(input.dueDate)}</dd></div>}{input.purchaseOrder && <div><dt>Order No.</dt><dd><b>{input.purchaseOrder}</b></dd></div>}</dl></div></div>
    <div className="invoice-paper-parties"><div><h3>BILL TO</h3>{customer.name && <strong>{customer.name}</strong>}<p>{customer.billingAddress}{customer.abn && <><br />ABN {formatAbn(customer.abn)}</>}{siteAsRecipient && (input.siteAddress || "Customer or work site")}</p></div>
      {input.siteAddress && !siteAsRecipient && <div><h3>WORK SITE</h3><p>{input.siteAddress}</p></div>}</div>
    <table><thead><tr><th>Qty</th><th>Description</th><th>Unit price</th><th>Amount (ex GST)</th></tr></thead><tbody>{input.items.map((item, i) => <tr key={i}><td>{item.quantity} {item.unit}</td><td>{item.description || "Description"}</td><td>{aud(Math.round(Number(item.unitPrice || 0) * 100))}</td><td>{aud(totals.lines[i] || 0)}</td></tr>)}</tbody></table>
    <dl><div><dt>Subtotal (excluding GST)</dt><dd>{aud(totals.subtotal)}</dd></div><div><dt>GST (10%)</dt><dd>{aud(totals.gst)}</dd></div><div className="invoice-paper-total"><dt>TOTAL (inc. GST)</dt><dd>{aud(totals.total)}</dd></div></dl>
    <div className="invoice-paper-bank"><h3>PAYMENT BY BANK TRANSFER</h3><div><span>Account name<b>{company.bankAccountName || "-"}</b></span><span>BSB<b className="invoice-paper-big">{company.bsb ? formatBsb(company.bsb) : "-"}</b></span><span>Account number<b className="invoice-paper-big">{company.bankAccountNumber || "-"}</b></span>{reference && <span>Reference<b>{reference}</b></span>}</div></div>
    {input.notes && <><h3>NOTES</h3><p>{input.notes}</p></>}
  </div>;
}
