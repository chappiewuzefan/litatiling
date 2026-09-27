"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Alert, App, Button, Input, Modal, Select, Space } from "antd";
import { aud, blankInvoice, calculateTotals, cents, formatAbn, formatBsb, formatDate, issueProblems, nonEnglish, numberInput, type Company, type InvoiceInput, type InvoiceRecord } from "@/lib/invoice/domain";
import { api, ApiError, createCommandSender, errorText, uid, type Bootstrap } from "./client";
import { DeleteDraftButton } from "./delete-draft";
import { ExportButtons } from "./exports";

export type EditorHandle = { flush: () => Promise<void> };
type Props = { data: Bootstrap; initial?: InvoiceRecord; copy?: InvoiceInput; onDone: (id: string) => void; onReload: () => void; onDeleted: () => void; onOpenSettings: () => void; refresh: () => Promise<void> };
const units = ["m²", "m", "each", "job", "hour", "day"].map(value => ({ value, label: value }));
// Red outline plus a hint while typing, instead of an error only when issuing.
function EnglishHint({ value }: { value: string }) {
  return nonEnglish(value) ? <small className="invoice-field-hint">发票是英文的，这里请用英文填写</small> : null;
}
const english = (value: string) => nonEnglish(value) ? "error" as const : undefined;

export const InvoiceEditor = forwardRef<EditorHandle, Props>(function InvoiceEditor({ data, initial, copy, onDone, onReload, onDeleted, onOpenSettings, refresh }, ref) {
  const { message } = App.useApp();
  const [input, setInput] = useState<InvoiceInput>(() => initial?.input || copy || blankInvoice());
  const [record, setRecord] = useState(initial);
  // Copies start as pending so they are saved once as a new draft.
  const [saveState, setSaveState] = useState(initial ? "已保存" : copy ? "待保存…" : "填写后自动保存");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [conflict, setConflict] = useState(false), [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState<string[] | null>(null);
  const inputRef = useRef(input), recordRef = useRef(record), idRef = useRef(initial?.id || uid());
  // A fresh blank invoice starts as "saved" so leaving it untouched never creates an empty draft; copies still save at once.
  const saved = useRef(initial ? JSON.stringify(initial.input) : copy ? "" : JSON.stringify(input));
  const pending = useRef<Record<string, unknown> | null>(null), flight = useRef<Promise<void> | null>(null), blocked = useRef(false), deleting = useRef(false);
  const send = useRef(createCommandSender());
  const revision = initial?.status === "issued";
  const company = (revision && initial.company) || data.settings.company;
  const dirtyRevision = revision && JSON.stringify(initial.input) !== JSON.stringify(input);
  const change = (value: InvoiceInput) => { inputRef.current = value; setInput(value); if (!revision) setSaveState("待保存…"); };
  const field = <K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) => change({ ...inputRef.current, [key]: value });
  const customerField = (key: keyof InvoiceInput["customer"], value: string) => field("customer", { ...inputRef.current.customer, [key]: value });
  const flush = useCallback(async () => {
    if (revision) {
      if (JSON.stringify(initial.input) !== JSON.stringify(inputRef.current)) throw new Error("请先提交更正，或点击取消更正");
      return;
    }
    if (deleting.current) return;
    if (blocked.current) throw new Error("请先重新打开服务器上的最新版本");
    if (flight.current) await flight.current;
    if (saved.current === JSON.stringify(inputRef.current) && (recordRef.current || !copy)) { setSaveState(recordRef.current ? "已保存" : "填写后自动保存"); return; }
    flight.current = (async () => {
      while (saved.current !== JSON.stringify(inputRef.current) || !recordRef.current || pending.current) {
        const command = pending.current || { action: "save", id: idRef.current, expectedVersion: recordRef.current?.lockVersion || 0, input: structuredClone(inputRef.current) };
        pending.current = command; setSaveState("保存中…");
        try {
          const result = await send.current(command);
          recordRef.current = result.invoice; setRecord(result.invoice);
          saved.current = JSON.stringify(command.input); pending.current = null; setSaveState("已保存"); setError("");
        } catch (e) {
          setSaveState("保存失败");
          if (e instanceof ApiError && e.status === 409) { blocked.current = true; setConflict(true); }
          // A rejected save (4xx) definitely did not apply; rebuild the next attempt from the current input
          // instead of resending the rejected content. Network/5xx failures keep the same operation for replay.
          else if (e instanceof ApiError && e.status >= 400 && e.status < 500) pending.current = null;
          setError(errorText(e)); throw e;
        }
      }
    })();
    try { await flight.current; } finally { flight.current = null; }
  }, [revision, initial, copy]);
  useImperativeHandle(ref, () => ({ flush }), [flush]);
  useEffect(() => {
    if (revision || conflict || saveState !== "待保存…") return;
    const timeout = setTimeout(() => { void flush().catch(() => {}); }, 800);
    return () => clearTimeout(timeout);
  }, [input, revision, conflict, flush, saveState]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(inputRef.current) !== saved.current) { event.preventDefault(); }
    };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  // Save first, then show every remaining problem (or a final confirmation) before the number is allocated.
  async function review() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!revision) await flush();
      const problems = issueProblems(inputRef.current, company);
      if (revision && !reason.trim()) problems.push("请填写英文更正原因");
      if (revision && nonEnglish(reason)) problems.push("更正原因请用英文填写");
      setConfirming(problems);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  async function issue() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!revision) await flush();
      if (!recordRef.current) { setConfirming(null); setError("请先填写发票内容"); return; }
      const current = recordRef.current;
      const result = await send.current(revision ? { action: "revise", id: current.id, expectedVersion: current.lockVersion, input: inputRef.current, reason } : { action: "issue", id: current.id, expectedVersion: current.lockVersion });
      saved.current = JSON.stringify(inputRef.current);
      setConfirming(null);
      message.success(revision ? "更正已提交，旧版本已留档" : `已开票：${result.invoice.number}`);
      onDone(result.invoice.id);
    } catch (e) { setConfirming(null); setError(errorText(e)); if (e instanceof ApiError && e.status === 409) { blocked.current = true; setConflict(true); } }
    finally { setBusy(false); }
  }
  async function saveCustomer() {
    setBusy(true);
    try {
      // Update the saved customer with the same name instead of creating duplicates.
      const match = data.customers.find(c => c.name.trim().toLowerCase() === input.customer.name.trim().toLowerCase());
      await api(`customers/${match?.id || uid()}`, { data: input.customer, version: match?.version || 0 });
      await refresh();
      message.success(match ? "已更新常用客户" : "已保存到常用客户");
    } catch (e) { message.error(errorText(e)); } finally { setBusy(false); }
  }
  const totals = (() => { try { return calculateTotals(input.items); } catch { return { subtotal: 0, gst: 0, total: 0, lines: [] }; } })();
  const updateLine = (i: number, patch: Partial<InvoiceInput["items"][number]>) => field("items", inputRef.current.items.map((item, n) => n === i ? { ...item, ...patch } : item));
  function move(i: number, direction: number) { const items = [...input.items]; [items[i], items[i + direction]] = [items[i + direction], items[i]]; field("items", items); }
  const title = revision ? `更正 ${initial.number}` : initial ? "继续填写草稿" : copy ? "新发票（复制）" : "新建发票";
  const statusText = revision ? "提交后保留旧版本" : saveState === "已保存" ? "已自动保存" : saveState;
  return <>
    <div className="invoice-section-heading"><div><h1>{title}</h1><p>{revision ? "修改后填写更正原因提交，原版本和文件会保留。" : "填写客户和施工项目，内容会自动保存为草稿。"}</p></div>
      {record && !revision && <DeleteDraftButton prepare={async () => { deleting.current = true; await flight.current?.catch(() => {}); return recordRef.current; }} onFailed={() => { deleting.current = false; }} onDeleted={() => { saved.current = JSON.stringify(inputRef.current); onDeleted(); }} />}</div>
    {error && <Alert className="invoice-alert" type="error" title={error} action={conflict ? <Button onClick={onReload}>重新打开最新版本</Button> : <Button onClick={() => void flush().catch(() => {})}>重试保存</Button>} />}
    {!revision && !data.settings.company.verified && <Alert className="invoice-alert" type="warning" title="公司、GST 和银行资料还没有核实。可以先填写草稿，正式开票前请完成设置。" action={<Button onClick={onOpenSettings}>去设置</Button>} />}
    <div className="invoice-editor-grid">
      <div className="invoice-form-column">
        <section className="invoice-panel"><h2>客户与工地</h2>
          {data.customers.length > 0 && <label className="invoice-field">从常用客户带入<Select showSearch value={null} optionFilterProp="label" placeholder="搜索客户名称" options={data.customers.map(c => ({ value: c.id, label: c.name }))} onChange={id => { const c = data.customers.find(c => c.id === id); if (c) field("customer", { name: c.name, billingAddress: c.billingAddress, abn: c.abn, email: c.email, phone: c.phone }); }} /></label>}
          <div className="invoice-fields"><label className="invoice-field">客户姓名 / 公司名称<Input value={input.customer.name} maxLength={200} status={english(input.customer.name)} placeholder="例如 Jane Smith" onChange={e => customerField("name", e.target.value)} /><EnglishHint value={input.customer.name} /></label><label className="invoice-field">客户 ABN（选填）<Input value={input.customer.abn} maxLength={30} inputMode="numeric" onChange={e => customerField("abn", e.target.value)} /></label></div>
          <small className="invoice-muted">A$1,000 及以上的发票需要填写客户名称或 ABN；金额较小时可以只写施工地址。</small>
          <label className="invoice-field">账单地址（选填）<Input value={input.customer.billingAddress} maxLength={500} status={english(input.customer.billingAddress)} onChange={e => customerField("billingAddress", e.target.value)} /><EnglishHint value={input.customer.billingAddress} /></label>
          <div className="invoice-fields"><label className="invoice-field">客户邮箱（选填）<Input type="email" value={input.customer.email} maxLength={200} onChange={e => customerField("email", e.target.value)} />{input.customer.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.customer.email) && <small className="invoice-field-hint">邮箱格式看起来不完整</small>}</label><label className="invoice-field">客户电话（选填）<Input type="tel" value={input.customer.phone} maxLength={50} onChange={e => customerField("phone", e.target.value)} /></label></div>
          <Button size="small" disabled={busy || !input.customer.name.trim()} onClick={() => void saveCustomer()}>保存为常用客户</Button>
          <label className="invoice-field">施工地址<Input value={input.siteAddress} maxLength={500} status={english(input.siteAddress)} placeholder="例如 11 Maxday Lane, Macnamara ACT" onChange={e => field("siteAddress", e.target.value)} /><EnglishHint value={input.siteAddress} /></label>
          <div className="invoice-fields"><label className="invoice-field">开票日期<Input type="date" value={input.date} onChange={e => field("date", e.target.value)} /></label><label className="invoice-field">付款到期日（选填）<Input type="date" value={input.dueDate} min={input.date} onChange={e => field("dueDate", e.target.value)} /></label></div>
          <label className="invoice-field">PO / 订单号（选填）<Input value={input.purchaseOrder} maxLength={100} status={english(input.purchaseOrder)} onChange={e => field("purchaseOrder", e.target.value)} /><EnglishHint value={input.purchaseOrder} /></label>
        </section>
        <section className="invoice-panel"><h2>施工项目 <small>单价均不含 GST</small></h2>
          <Select className="invoice-preset-select" showSearch value={null} optionFilterProp="label" placeholder="＋ 添加常用项目：防水、铺砖、找平…" options={data.items.map(p => ({ value: p.id, label: `${p.label} / ${p.description}${p.unitPrice ? ` · ${aud(cents(p.unitPrice))}` : ""}` }))} onChange={id => { const p = data.items.find(p => p.id === id)!; const row = { description: p.description, unit: p.unit, quantity: p.quantity, unitPrice: p.unitPrice }; const items = inputRef.current.items; field("items", items.length === 1 && !items[0].description && !items[0].unitPrice ? [row] : [...items, row]); }} />
          {input.items.map((item, i) => <div className="invoice-line" key={i}>
            <div className="invoice-line-top"><strong>项目 {i + 1}</strong><Space size={4} wrap><Button size="small" aria-label={`项目 ${i + 1} 上移`} disabled={!i} onClick={() => move(i, -1)}>↑</Button><Button size="small" aria-label={`项目 ${i + 1} 下移`} disabled={i === input.items.length - 1} onClick={() => move(i, 1)}>↓</Button><Button size="small" onClick={() => field("items", [...input.items.slice(0, i + 1), { ...item }, ...input.items.slice(i + 1)])}>复制</Button><Button danger size="small" disabled={input.items.length === 1} onClick={() => field("items", input.items.filter((_, n) => n !== i))}>删除</Button></Space></div>
            <label className="invoice-field">施工描述（英文）<Input.TextArea autoSize={{ minRows: 1, maxRows: 5 }} maxLength={1000} value={item.description} status={english(item.description)} placeholder="例如 Waterproofing - 2 bathrooms, 1 laundry" onChange={e => updateLine(i, { description: e.target.value })} /><EnglishHint value={item.description} /></label>
            <div className="invoice-line-numbers"><label className="invoice-field">数量<Input inputMode="decimal" value={item.quantity} onChange={e => updateLine(i, { quantity: numberInput(e.target.value) })} /></label><label className="invoice-field">单位<Select value={item.unit} options={units} onChange={unit => updateLine(i, { unit })} /></label><label className="invoice-field">单价（不含 GST）<Input inputMode="decimal" prefix="$" value={item.unitPrice} placeholder="0.00" onChange={e => updateLine(i, { unitPrice: numberInput(e.target.value, 2) })} /></label></div>
            <div className="invoice-line-total">小计 {aud(totals.lines[i] || 0)}</div>
          </div>)}
          <Button block type="dashed" disabled={input.items.length >= 100} onClick={() => field("items", [...input.items, { description: "", quantity: "1", unit: "job", unitPrice: "" }])}>＋ 添加空白项目</Button>
          <label className="invoice-field">备注（英文，显示在发票上，选填）<Input.TextArea value={input.notes} maxLength={1500} status={english(input.notes)} onChange={e => field("notes", e.target.value)} /><EnglishHint value={input.notes} /></label>
          {revision && <label className="invoice-field">更正原因（英文，必填）<Input.TextArea value={reason} status={english(reason)} placeholder="例如 Corrected tiling area after final measurement" maxLength={500} onChange={e => setReason(e.target.value)} /><EnglishHint value={reason} /></label>}
        </section>
      </div>
      <aside className="invoice-preview-column"><InvoicePaper input={input} company={company} number={initial?.number || "DRAFT"} /><p className="invoice-preview-note">实时预览 · 正式 PDF 按 A4 自动分页</p></aside>
    </div>
    <div className="invoice-action-bar">
      <div className="invoice-action-total"><small>含 GST 总额</small><strong>{aud(totals.total)}</strong><small>不含 GST {aud(totals.subtotal)} · GST {aud(totals.gst)}</small></div>
      <div className="invoice-action-buttons">
        <span className={`invoice-save-state${saveState === "保存失败" ? " is-error" : ""}`} role="status">{statusText}</span>
        {revision && <Button onClick={onReload}>取消更正</Button>}
        {record && !revision && saveState === "已保存" && <ExportButtons url={`/api/invoice/preview/${record.id}`} name="LITA-DRAFT" label="预览草稿" />}
        <Button type="primary" size="large" disabled={conflict || (revision && !dirtyRevision)} loading={busy} onClick={() => void review()}>{revision ? "提交更正" : "正式开票"}</Button>
      </div>
    </div>
    <Modal open={!!confirming} title={confirming?.length ? "还差几项才能开票" : revision ? "确认提交更正" : "确认正式开票"} onCancel={() => !busy && setConfirming(null)} destroyOnHidden
      footer={confirming?.length ? <Button type="primary" onClick={() => setConfirming(null)}>返回修改</Button> : [<Button key="back" disabled={busy} onClick={() => setConfirming(null)}>再检查一下</Button>, <Button key="ok" type="primary" loading={busy} onClick={() => void issue()}>{revision ? "确认提交" : "确认开票"}</Button>]}>
      {confirming?.length ? <ul className="invoice-problem-list">{confirming.map(p => <li key={p}>{p}{p.includes("设置") && <> · <a onClick={() => { setConfirming(null); onOpenSettings(); }}>去设置</a></>}</li>)}</ul> : <div className="invoice-confirm">
        <dl><div><dt>客户</dt><dd>{input.customer.name || input.siteAddress || "-"}</dd></div>{input.siteAddress && input.customer.name && <div><dt>施工地址</dt><dd>{input.siteAddress}</dd></div>}<div><dt>项目</dt><dd>{input.items.length} 项</dd></div><div><dt>含 GST 总额</dt><dd><strong>{aud(totals.total)}</strong>{revision && initial && <small>（原 {aud(initial.totals.total)}）</small>}</dd></div></dl>
        <p>{revision ? "提交后会生成新版本发票；如果金额有变化，会同时生成英文调整单（Adjustment Note）。原版本保留可查。" : "开票后会分配正式编号，内容不能再直接修改；之后如需修改，请使用“更正”（保留旧版本）或“作废”。"}</p>
      </div>}
    </Modal>
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
    <table><thead><tr><th>Qty</th><th>Description</th><th>Unit price</th><th>Amount (ex GST)</th></tr></thead><tbody>{input.items.map((item, i) => <tr key={i}><td>{item.quantity} {item.unit}</td><td>{item.description || "Description"}</td><td>{aud(cents(item.unitPrice))}</td><td>{aud(totals.lines[i] || 0)}</td></tr>)}</tbody></table>
    <dl><div><dt>Subtotal (excluding GST)</dt><dd>{aud(totals.subtotal)}</dd></div><div><dt>GST (10%)</dt><dd>{aud(totals.gst)}</dd></div><div className="invoice-paper-total"><dt>TOTAL (inc. GST)</dt><dd>{aud(totals.total)}</dd></div></dl>
    <div className="invoice-paper-bank"><h3>PAYMENT BY BANK TRANSFER</h3><div><span>Account name<b>{company.bankAccountName || "-"}</b></span><span>BSB<b className="invoice-paper-big">{company.bsb ? formatBsb(company.bsb) : "-"}</b></span><span>Account number<b className="invoice-paper-big">{company.bankAccountNumber || "-"}</b></span>{reference && <span>Reference<b>{reference}</b></span>}</div></div>
    {input.notes && <><h3>NOTES</h3><p>{input.notes}</p></>}
  </div>;
}
