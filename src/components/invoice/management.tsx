"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Checkbox, Empty, Form, Input, InputNumber, Modal, Pagination, Select, Space, Spin, Tag } from "antd";
import { aud, blankInvoice, defaultCompany, emptyCustomer, paymentState, sydneyDate, type Company, type Customer, type InvoiceInput, type InvoiceRecord, type Preset } from "@/lib/invoice/domain";
import { api, createCommandSender, errorText, uid, type Bootstrap, type CustomerEntry, type Detail, type PresetEntry } from "./client";
import { ExportButtons } from "./exports";
import { InvoicePaper } from "./editor";

const statusNames = { draft: "草稿", issued: "已开票", void: "已作废" };
const paymentNames: Record<string, string> = { unpaid: "未付", partial: "部分已付", paid: "已付", overpaid: "多收款" };
export function StatusTags({ invoice }: { invoice: InvoiceRecord }) {
  const payment = paymentState(invoice);
  return <Space size={4} wrap><Tag>{statusNames[invoice.status]}</Tag>{invoice.status !== "draft" && <Tag color={payment.status === "paid" ? "green" : payment.status === "overpaid" ? "orange" : "blue"}>{paymentNames[payment.status]}</Tag>}{payment.overdue && <Tag color="red">逾期</Tag>}</Space>;
}

export function InvoiceHistory({ onOpen }: { onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<InvoiceRecord[] | null>(null), [error, setError] = useState("");
  const [search, setSearch] = useState(""), [status, setStatus] = useState("all"), [from, setFrom] = useState(""), [to, setTo] = useState(""), [page, setPage] = useState(1);
  const load = () => { setError(""); void api<InvoiceRecord[]>("records").then(setRows).catch(e => setError(errorText(e))); };
  useEffect(load, []);
  const filtered = (rows || []).filter(r => {
    const p = paymentState(r);
    const match = status === "all" || r.status === status || (r.status === "issued" && (p.status === status || status === "overdue" && p.overdue));
    return match && (!from || r.input.date >= from) && (!to || r.input.date <= to) && [r.number, r.input.customer.name, r.input.siteAddress].join(" ").toLowerCase().includes(search.toLowerCase());
  });
  return <>
    <div className="invoice-section-heading"><div><h1>历史发票</h1><p>查找、收款、更正，所有版本都有记录。</p></div><Button href="/api/invoice/export">导出 CSV 清单</Button></div>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>重试</Button>} />}
    <div className="invoice-filters"><Input.Search allowClear placeholder="搜索编号、客户、工地" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /><Select value={status} onChange={s => { setStatus(s); setPage(1); }} options={[['all', '全部'], ['draft', '草稿'], ['issued', '已开票'], ['unpaid', '未付'], ['partial', '部分已付'], ['paid', '已付'], ['overpaid', '多收款'], ['overdue', '逾期'], ['void', '作废']].map(([value, label]) => ({ value, label }))} /><Input type="date" aria-label="起始日期" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} /><Input type="date" aria-label="结束日期" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} /></div>
    {!rows && !error && <Spin />}
    {rows && !filtered.length && <Empty description="还没有符合条件的发票" />}
    <div className="invoice-record-list">{filtered.slice((page - 1) * 20, page * 20).map(r => <button className="invoice-record-row" key={r.id} onClick={() => onOpen(r.id)}><div><strong>{r.number || "未开票草稿"}</strong><span>{r.input.customer.name || "未填写客户"}</span><small>{r.input.siteAddress || "未填写施工地址"}</small></div><div><StatusTags invoice={r} /><small>{r.input.date}</small></div><div className="invoice-record-amount"><strong>{aud(r.totals.total)}</strong><small>余额 {aud(paymentState(r).balance)}</small></div></button>)}</div>
    <Pagination current={page} pageSize={20} total={filtered.length} onChange={setPage} showSizeChanger={false} hideOnSinglePage />
  </>;
}

export function InvoiceDetail({ id, onEdit, onCopy }: { id: string; onEdit: (r: InvoiceRecord) => void; onCopy: (input: InvoiceInput) => void }) {
  const [detail, setDetail] = useState<Detail | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false), [action, setAction] = useState<{ type: "void" | "reverse-payment"; paymentId?: string } | null>(null), [reason, setReason] = useState("");
  const [form] = Form.useForm();
  const send = useRef(createCommandSender());
  const load = () => api<Detail>(`records/${id}`).then(setDetail);
  useEffect(() => { void api<Detail>(`records/${id}`).then(setDetail).catch(e => setError(errorText(e))); }, [id]);
  async function command(data: Record<string, unknown>) {
    if (!detail || busy) return;
    setBusy(true); setError("");
    try {
      const result = await send.current({ ...data, id, expectedVersion: detail.invoice.lockVersion });
      await load(); setPaymentOpen(false); setAction(null); setReason("");
      if (!result.archiveReady) setError("数据已保存，文件暂未生成。点击导出会重试，不会重复开票。");
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  if (!detail) return error ? <Alert type="error" title={error} action={<Button onClick={() => void load().catch(e => setError(errorText(e)))}>重试</Button>} /> : <Spin />;
  const { invoice, versions, payments } = detail;
  const balance = paymentState(invoice).balance;
  return <>
    <div className="invoice-section-heading"><div><h1>{invoice.number || "发票草稿"}</h1><StatusTags invoice={invoice} /></div><Space wrap>{invoice.status !== "void" && <Button onClick={() => onEdit(invoice)}>{invoice.status === "draft" ? "继续填写" : "更正发票"}</Button>}<Button onClick={() => { const fresh = blankInvoice(); onCopy({ ...structuredClone(invoice.input), date: fresh.date, dueDate: fresh.dueDate }); }}>复制为新发票</Button></Space></div>
    {error && <Alert className="invoice-alert" type="warning" title={error} action={<Button onClick={() => void load().catch(e => setError(errorText(e)))}>重新加载</Button>} />}
    <div className="invoice-detail-grid"><section><div className="invoice-panel"><h2>收款情况</h2><div className="invoice-money-summary"><div><small>应收总额</small><strong>{aud(invoice.status === "void" ? 0 : invoice.totals.total)}</strong></div><div><small>已收到</small><strong>{aud(invoice.paidCents)}</strong></div><div><small>{balance < 0 ? "多收金额" : "剩余应收"}</small><strong>{aud(Math.abs(balance))}</strong></div></div>
      {balance < 0 && <Alert type="warning" title="存在多收款，请人工核对退款或后续处理；系统不会自动退款。" />}
      {invoice.status === "issued" && <Button type="primary" onClick={() => { form.setFieldsValue({ amount: balance > 0 ? (balance / 100).toFixed(2) : "", date: sydneyDate(), method: "Bank transfer", note: "" }); setPaymentOpen(true); }}>登记收款</Button>}
      {payments.length === 0 && <p className="invoice-muted">尚无收款记录</p>}
      {payments.map(p => <div className="invoice-payment-row" key={p.id}><div><strong>{aud(p.cents)}</strong> {p.reversedAt && <Tag>已撤销</Tag>}<small>{p.date} · {p.method}</small><small>{p.note}{p.reversalReason && ` · 撤销原因：${p.reversalReason}`}</small></div>{!p.reversedAt && <Button size="small" onClick={() => { setReason(""); setAction({ type: "reverse-payment", paymentId: p.id }); }}>撤销误录</Button>}</div>)}
    </div><div className="invoice-panel"><h2>文件与历史版本</h2>
      {invoice.status === "draft" && <ExportButtons url={`/api/invoice/preview/${id}`} name="LITA-DRAFT" label="草稿" />}
      {versions.map(v => <div className="invoice-version" key={v.version}><div><strong>版本 {v.version}</strong> {v.version === invoice.version ? <Tag color="blue">当前版本</Tag> : <Tag>历史版本</Tag>}{v.void && <Tag>作废记录</Tag>}</div><small>{new Date(v.createdAt).toLocaleString("zh-CN", { timeZone: "Australia/Sydney" })}</small><p>{v.reason}</p><ExportButtons url={`/api/invoice/files/${id}/${v.version}/invoice`} name={`${v.number}-v${v.version}`} />{v.adjustment && <div className="invoice-adjustment"><p>调整单 · 含税差额 {aud(v.adjustment.deltaTotal)}</p><ExportButtons url={`/api/invoice/files/${id}/${v.version}/adjustment`} name={`${v.number}-ADJ-${v.version}`} label="调整单" /></div>}</div>)}
    </div>{invoice.status === "issued" && <Button danger onClick={() => { setReason(""); setAction({ type: "void" }); }}>作废发票并保留记录</Button>}</section>
    <aside><InvoicePaper input={invoice.input} company={invoice.company || defaultCompany} number={invoice.number || "DRAFT"} />{invoice.status === "void" && <Alert type="warning" title="此发票已作废；右侧内容仅用于回溯。" />}</aside></div>
    <Modal title="登记收款" open={paymentOpen} onCancel={() => !busy && setPaymentOpen(false)} onOk={() => form.submit()} confirmLoading={busy} okText="保存收款" cancelText="取消"><Form form={form} layout="vertical" onFinish={v => void command({ action: "payment", ...v })}><Form.Item name="amount" label="实收金额 AUD" rules={[{ required: true }]}><Input inputMode="decimal" /></Form.Item><Form.Item name="date" label="收款日期" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item name="method" label="收款方式"><Select options={[{ value: "Bank transfer", label: "银行转账" }, { value: "Cash", label: "现金" }, { value: "Other", label: "其他" }]} /></Form.Item><Form.Item name="note" label="备注"><Input.TextArea maxLength={500} /></Form.Item></Form></Modal>
    <Modal title={action?.type === "void" ? "作废发票" : "撤销收款记录"} open={!!action} confirmLoading={busy} onCancel={() => !busy && setAction(null)} okText="确认" cancelText="取消" onOk={() => { if (action && reason.trim()) void command({ action: action.type, ...(action.paymentId ? { paymentId: action.paymentId } : {}), reason }); }}><p>{action?.type === "void" ? "原始发票和收款记录将保留，并生成全额调整单。请填写英文作废原因。" : "保留原收款记录，并从已收金额中扣除。请填写撤销原因。"}</p><Input.TextArea value={reason} maxLength={500} onChange={e => setReason(e.target.value)} /></Modal>
  </>;
}

export function Catalog({ kind, data, refresh }: { kind: "customers" | "items"; data: Bootstrap; refresh: () => Promise<void> }) {
  const [editing, setEditing] = useState<{ id: string; version: number } | null>(null), [search, setSearch] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [form] = Form.useForm(); const customers = kind === "customers";
  const rows = customers ? data.customers : data.items;
  function edit(row?: CustomerEntry | PresetEntry) {
    setError(""); setEditing(row ? { id: row.id, version: row.version } : { id: uid(), version: 0 });
    form.resetFields();
    if (row) { const { id: _id, version: _version, ...values } = row; void _id; void _version; form.setFieldsValue(values); }
    else form.setFieldsValue(customers ? emptyCustomer : { label: "", description: "", quantity: "1", unit: "job", unitPrice: "" });
  }
  async function save(values: Customer | Preset) {
    if (!editing) return; setBusy(true); setError("");
    try { await api(`${kind}/${editing.id}`, { data: values, version: editing.version }); await refresh(); setEditing(null); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <><div className="invoice-section-heading"><div><h1>{customers ? "客户" : "常用项目"}</h1><p>{customers ? "保存常用客户，开票时快速带入。" : "中文查找，英文出单。单价留空时在开票时填写。"}</p></div><Button type="primary" onClick={() => edit()}>＋ {customers ? "新增客户" : "新增项目"}</Button></div>
    <Input.Search className="invoice-catalog-search" placeholder="搜索" allowClear value={search} onChange={e => setSearch(e.target.value)} />
    <div className="invoice-catalog-list">{rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map(r => <div className="invoice-catalog-row" key={r.id}><div><strong>{"name" in r ? r.name : r.label}</strong><p>{"name" in r ? r.billingAddress || r.email : r.description}</p>{"unitPrice" in r && <small>{r.unitPrice ? `${aud(Number(r.unitPrice) * 100)} / ${r.unit}` : `开票时填价 / ${r.unit}`}</small>}</div><Button onClick={() => edit(r)}>编辑</Button></div>)}</div>
    <Modal title={customers ? "客户资料" : "常用项目"} open={!!editing} onCancel={() => !busy && setEditing(null)} confirmLoading={busy} onOk={() => form.submit()} okText="保存" cancelText="取消">{error && <Alert type="error" title={error} />}<Form form={form} layout="vertical" onFinish={save}>
      {customers ? <><Form.Item name="name" label="客户姓名 / 公司名称（英文）" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="billingAddress" label="账单地址（英文）"><Input.TextArea /></Form.Item><Form.Item name="email" label="邮箱"><Input type="email" /></Form.Item><Form.Item name="phone" label="电话"><Input type="tel" /></Form.Item><Form.Item name="abn" label="ABN（选填）"><Input /></Form.Item></> : <><Form.Item name="label" label="中文快捷名称" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="description" label="英文施工描述" rules={[{ required: true }]}><Input.TextArea /></Form.Item><Form.Item name="quantity" label="默认数量"><Input inputMode="decimal" /></Form.Item><Form.Item name="unit" label="单位"><Select options={["m²", "m", "each", "job", "hour", "day"].map(value => ({ value, label: value }))} /></Form.Item><Form.Item name="unitPrice" label="未税单价 AUD（可留空）"><Input inputMode="decimal" /></Form.Item></>}
    </Form></Modal></>;
}

export function CompanySettings({ data, refresh }: { data: Bootstrap; refresh: () => Promise<void> }) {
  const [form] = Form.useForm<Company>(), [busy, setBusy] = useState(false), [error, setError] = useState(""), [saved, setSaved] = useState(false);
  useEffect(() => form.setFieldsValue(data.settings.company), [data.settings.company, form]);
  async function save(company: Company) {
    setBusy(true); setError(""); setSaved(false);
    try { await api("settings", { company, version: data.settings.version }); await refresh(); setSaved(true); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <><div className="invoice-section-heading"><div><h1>公司与开票设置</h1><p>用于之后开出的发票，历史文件保持不变。</p></div></div><section className="invoice-panel invoice-settings">{error && <Alert type="error" title={error} />}{saved && <Alert type="success" title="设置已保存" />}<Form form={form} layout="vertical" onFinish={save}>
    <Form.Item name="name" label="公司法定名称（英文）" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="abn" label="ABN（11 位）"><Input inputMode="numeric" /></Form.Item><Form.Item name="address" label="公司地址（英文）"><Input.TextArea /></Form.Item><div className="invoice-fields"><Form.Item name="email" label="邮箱"><Input type="email" /></Form.Item><Form.Item name="phone" label="电话"><Input type="tel" /></Form.Item></div>
    <h2>收款账户</h2><Form.Item name="bankAccountName" label="账户名称（英文）"><Input /></Form.Item><div className="invoice-fields"><Form.Item name="bsb" label="BSB（6 位）"><Input inputMode="numeric" /></Form.Item><Form.Item name="bankAccountNumber" label="账号"><Input inputMode="numeric" /></Form.Item></div>
    <Form.Item name="defaultTermsDays" label="默认付款期限（天）"><InputNumber min={0} max={90} /></Form.Item><Form.Item name="gstRegistered" valuePropName="checked"><Checkbox>公司已登记 GST，所有项目按未税价格另加 10% GST</Checkbox></Form.Item><Form.Item name="verified" valuePropName="checked"><Checkbox>我已核实公司名称、ABN、GST 登记状态和收款账户</Checkbox></Form.Item><Button type="primary" htmlType="submit" loading={busy}>保存设置</Button>
  </Form></section></>;
}
