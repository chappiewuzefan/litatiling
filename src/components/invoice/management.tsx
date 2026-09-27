"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, App, Button, Checkbox, Empty, Form, Input, Modal, Pagination, Popconfirm, Select, Space, Spin, Tag } from "antd";
import { aud, blankInvoice, cents, defaultCompany, emptyCustomer, formatDate, nonEnglish, numberInput, paymentState, sydneyDate, type Company, type Customer, type InvoiceInput, type InvoiceRecord, type Preset } from "@/lib/invoice/domain";
import { api, createCommandSender, errorText, uid, type Bootstrap, type CustomerEntry, type Detail, type PresetEntry } from "./client";
import { DeleteDraftButton } from "./delete-draft";
import { ExportButtons } from "./exports";
import { InvoicePaper } from "./editor";

const statusNames = { draft: "草稿", issued: "已开票", void: "已作废" };
const paymentNames: Record<string, string> = { unpaid: "未付", partial: "部分已付", paid: "已付清", overpaid: "多收款" };
const methodNames: Record<string, string> = { "Bank transfer": "银行转账", Cash: "现金", Other: "其他" };
export function StatusTags({ invoice }: { invoice: InvoiceRecord }) {
  const payment = paymentState(invoice);
  return <Space size={4} wrap><Tag>{statusNames[invoice.status]}</Tag>{invoice.status !== "draft" && <Tag color={payment.status === "paid" ? "green" : payment.status === "overpaid" ? "orange" : "blue"}>{paymentNames[payment.status]}</Tag>}{payment.overdue && <Tag color="red">逾期</Tag>}</Space>;
}

export function InvoiceHistory({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const [rows, setRows] = useState<InvoiceRecord[] | null>(null), [error, setError] = useState("");
  const [search, setSearch] = useState(""), [status, setStatus] = useState("all"), [from, setFrom] = useState(""), [to, setTo] = useState(""), [page, setPage] = useState(1);
  const load = () => { setError(""); void api<InvoiceRecord[]>("records").then(setRows).catch(e => setError(errorText(e))); };
  useEffect(load, []);
  const filter = (next: string) => { setStatus(next); setPage(1); };
  const filtered = (rows || []).filter(r => {
    const p = paymentState(r);
    const match = status === "all" || r.status === status || (r.status === "issued" && (p.status === status || status === "outstanding" && p.balance > 0 || status === "overdue" && p.overdue));
    const haystack = [r.number, r.input.customer.name, r.input.customer.billingAddress, r.input.siteAddress, r.input.purchaseOrder].join(" ").toLowerCase();
    return match && (!from || r.input.date >= from) && (!to || r.input.date <= to) && haystack.includes(search.trim().toLowerCase());
  });
  const issued = (rows || []).filter(r => r.status === "issued").map(r => paymentState(r));
  const outstanding = issued.filter(p => p.balance > 0);
  const overdue = issued.filter(p => p.overdue);
  const drafts = (rows || []).filter(r => r.status === "draft").length;
  const filtering = status !== "all" || !!search || !!from || !!to;
  return <>
    <div className="invoice-section-heading"><div><h1>历史发票</h1><p>查找、收款、更正，所有版本都有记录。</p></div><Space wrap><Button href="/api/invoice/export">导出 CSV 清单</Button><Button type="primary" onClick={onNew}>＋ 新建发票</Button></Space></div>
    {error && <Alert className="invoice-alert" type="error" title={error} action={<Button onClick={load}>重试</Button>} />}
    {rows && rows.length > 0 && <div className="invoice-stats">
      <button type="button" aria-pressed={status === "outstanding"} onClick={() => filter(status === "outstanding" ? "all" : "outstanding")}><small>待收款</small><strong>{aud(outstanding.reduce((sum, p) => sum + p.balance, 0))}</strong><span>{outstanding.length} 张发票</span></button>
      <button type="button" aria-pressed={status === "overdue"} className={overdue.length ? "is-alert" : ""} onClick={() => filter(status === "overdue" ? "all" : "overdue")}><small>已逾期</small><strong>{overdue.length}</strong><span>张（有到期日且未付清）</span></button>
      <button type="button" aria-pressed={status === "draft"} onClick={() => filter(status === "draft" ? "all" : "draft")}><small>草稿</small><strong>{drafts}</strong><span>张未开票</span></button>
    </div>}
    <div className="invoice-filters"><Input.Search allowClear placeholder="搜索编号、客户、地址、订单号" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /><Select value={status} onChange={filter} options={[['all', '全部状态'], ['draft', '草稿'], ['issued', '已开票'], ['outstanding', '待收款'], ['unpaid', '未付'], ['partial', '部分已付'], ['paid', '已付清'], ['overpaid', '多收款'], ['overdue', '逾期'], ['void', '已作废']].map(([value, label]) => ({ value, label }))} /><Input type="date" aria-label="起始日期" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} /><Input type="date" aria-label="结束日期" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} /></div>
    {!rows && !error && <div className="invoice-loading"><Spin /></div>}
    {rows && !rows.length && <Empty description="还没有发票"><Button type="primary" onClick={onNew}>新建第一张发票</Button></Empty>}
    {rows && rows.length > 0 && !filtered.length && <Empty description="没有符合条件的发票">{filtering && <Button onClick={() => { setSearch(""); setStatus("all"); setFrom(""); setTo(""); }}>清除筛选</Button>}</Empty>}
    <div className="invoice-record-list">{filtered.slice((page - 1) * 20, page * 20).map(r => { const p = paymentState(r); return <button className="invoice-record-row" key={r.id} onClick={() => onOpen(r.id)}><div><strong>{r.number || "草稿（未开票）"}</strong><span>{r.input.customer.name || r.input.siteAddress || "未填写客户"}</span>{r.input.customer.name && <small>{r.input.siteAddress || "未填写施工地址"}</small>}</div><div><StatusTags invoice={r} /><small>{formatDate(r.input.date)}</small></div><div className="invoice-record-amount"><strong>{aud(r.totals.total)}</strong><small>{r.status === "draft" ? "未开票" : r.status === "void" ? "已作废" : p.balance > 0 ? `待收 ${aud(p.balance)}` : p.balance < 0 ? `多收 ${aud(-p.balance)}` : "已付清"}</small></div></button>; })}</div>
    <Pagination current={page} pageSize={20} total={filtered.length} onChange={setPage} showSizeChanger={false} hideOnSinglePage />
  </>;
}

export function InvoiceDetail({ id, onEdit, onCopy, onDeleted }: { id: string; onEdit: (r: InvoiceRecord) => void; onCopy: (input: InvoiceInput) => void; onDeleted: () => void }) {
  const { message } = App.useApp();
  const [detail, setDetail] = useState<Detail | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false), [action, setAction] = useState<{ type: "void" | "reverse-payment"; paymentId?: string } | null>(null), [reason, setReason] = useState("");
  const [form] = Form.useForm();
  const send = useRef(createCommandSender());
  const load = () => api<Detail>(`records/${id}`).then(setDetail);
  useEffect(() => { void api<Detail>(`records/${id}`).then(setDetail).catch(e => setError(errorText(e))); }, [id]);
  async function command(data: Record<string, unknown>, done: string) {
    if (!detail || busy) return;
    setBusy(true); setError("");
    try {
      const result = await send.current({ ...data, id, expectedVersion: detail.invoice.lockVersion });
      await load(); setPaymentOpen(false); setAction(null); setReason("");
      message.success(done);
      if (!result.archiveReady) setError("数据已保存，文件暂未生成。点击导出会重试，不会重复开票。");
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  }
  if (!detail) return error ? <Alert type="error" title={error} action={<Button onClick={() => void load().catch(e => setError(errorText(e)))}>重试</Button>} /> : <div className="invoice-loading"><Spin /></div>;
  const { invoice, versions, payments } = detail;
  const balance = paymentState(invoice).balance;
  const current = versions.find(v => v.version === invoice.version);
  const copyAsNew = () => { const fresh = blankInvoice(); onCopy({ ...structuredClone(invoice.input), date: fresh.date, dueDate: "" }); };
  const reasonRequired = action?.type === "void";
  const reasonInvalid = !reason.trim() || (reasonRequired && nonEnglish(reason));
  return <>
    <div className="invoice-section-heading"><div><h1>{invoice.number || "草稿（未开票）"}</h1><StatusTags invoice={invoice} /></div>
      <Space wrap>
        {invoice.status === "draft" && <><Button type="primary" onClick={() => onEdit(invoice)}>继续填写</Button><ExportButtons url={`/api/invoice/preview/${id}`} name="LITA-DRAFT" label="预览草稿" /></>}
        {invoice.status !== "draft" && current && <ExportButtons primary url={`/api/invoice/files/${id}/${current.version}/invoice`} name={`${current.number}${current.version > 1 ? `-v${current.version}` : ""}`} />}
        {invoice.status === "issued" && <Button onClick={() => onEdit(invoice)}>更正发票</Button>}
        <Button onClick={copyAsNew}>复制为新发票</Button>
        {invoice.status === "draft" && <DeleteDraftButton prepare={() => invoice} onDeleted={onDeleted} />}
      </Space></div>
    {error && <Alert className="invoice-alert" type="warning" title={error} action={<Button onClick={() => void load().catch(e => setError(errorText(e)))}>重新加载</Button>} />}
    <div className="invoice-detail-grid"><section>
      {invoice.status === "draft" ? <div className="invoice-panel"><h2>还没有开票</h2><p className="invoice-muted">草稿没有发票号，不能登记收款。确认内容后，在编辑页点“正式开票”。</p></div> : <div className="invoice-panel"><h2>收款情况</h2>
        <div className="invoice-money-summary"><div><small>应收总额</small><strong>{aud(invoice.status === "void" ? 0 : invoice.totals.total)}</strong></div><div><small>已收到</small><strong>{aud(invoice.paidCents)}</strong></div><div className={balance > 0 ? "is-due" : ""}><small>{balance < 0 ? "多收金额" : "剩余应收"}</small><strong>{aud(Math.abs(balance))}</strong></div></div>
        {balance < 0 && <Alert className="invoice-alert" type="warning" title="存在多收款，请人工核对退款或后续处理；系统不会自动退款。" />}
        {invoice.status === "issued" && balance > 0 && <Button type="primary" onClick={() => { form.setFieldsValue({ amount: (balance / 100).toFixed(2), date: sydneyDate(), method: "Bank transfer", note: "" }); setPaymentOpen(true); }}>登记收款</Button>}
        {payments.length === 0 ? <p className="invoice-muted invoice-empty-line">尚无收款记录</p> : payments.map(p => <div className="invoice-payment-row" key={p.id}><div><strong>{aud(p.cents)}</strong> {p.reversedAt && <Tag>已撤销</Tag>}<small>{formatDate(p.date)} · {methodNames[p.method] || p.method}{p.note && ` · ${p.note}`}</small>{p.reversalReason && <small>撤销原因：{p.reversalReason}</small>}</div>{!p.reversedAt && <Button size="small" onClick={() => { setReason(""); setAction({ type: "reverse-payment", paymentId: p.id }); }}>撤销误录</Button>}</div>)}
      </div>}
      {versions.length > 0 && <div className="invoice-panel"><h2>文件与历史版本</h2>
        {versions.map(v => <div className="invoice-version" key={v.version}><div><strong>版本 {v.version}</strong> {v.version === invoice.version ? <Tag color="blue">当前版本</Tag> : <Tag>历史版本</Tag>}{v.void && <Tag>作废记录</Tag>}</div><small>{new Date(v.createdAt).toLocaleString("zh-CN", { timeZone: "Australia/Sydney" })}{v.reason !== "Original issue" && ` · ${v.reason}`}</small><Space wrap><ExportButtons size="small" label="发票文件" url={`/api/invoice/files/${id}/${v.version}/invoice`} name={`${v.number}${v.version > 1 ? `-v${v.version}` : ""}`} />{v.adjustment && <ExportButtons size="small" label={`调整单（含税差额 ${aud(v.adjustment.deltaTotal)}）`} url={`/api/invoice/files/${id}/${v.version}/adjustment`} name={`${v.number}-ADJ-${v.version}`} />}</Space></div>)}
      </div>}
      {invoice.status === "issued" && <div className="invoice-danger-zone"><div><strong>作废发票</strong><small>发票和收款记录都会保留，并生成全额调整单。</small></div><Button danger onClick={() => { setReason(""); setAction({ type: "void" }); }}>作废…</Button></div>}
    </section>
    <aside><InvoicePaper input={invoice.input} company={invoice.company || defaultCompany} number={invoice.number || "DRAFT"} />{invoice.status === "void" && <Alert type="warning" title="此发票已作废；上面的内容仅用于回溯。" />}</aside></div>
    <Modal title="登记收款" open={paymentOpen} onCancel={() => !busy && setPaymentOpen(false)} onOk={() => form.submit()} confirmLoading={busy} okText="保存收款" cancelText="取消" destroyOnHidden>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={v => void command({ action: "payment", ...v }, "收款已登记")}>
        <Form.Item name="amount" label="实收金额（AUD）" getValueFromEvent={e => numberInput(e.target.value, 2)} rules={[{ required: true, message: "请输入金额" }, { pattern: /^\d{1,8}(\.\d{1,2})?$/, message: "请输入金额，例如 1200 或 1200.50" }]} extra={balance > 0 ? `剩余应收 ${aud(balance)}，已为你填好，可修改。` : undefined}><Input inputMode="decimal" prefix="$" /></Form.Item>
        <Form.Item name="date" label="收款日期" rules={[{ required: true, message: "请选择日期" }]}><Input type="date" /></Form.Item>
        <Form.Item name="method" label="收款方式"><Select options={Object.entries(methodNames).map(([value, label]) => ({ value, label }))} /></Form.Item>
        <Form.Item name="note" label="备注（选填）"><Input.TextArea maxLength={500} autoSize={{ minRows: 1, maxRows: 4 }} /></Form.Item>
      </Form></Modal>
    <Modal title={action?.type === "void" ? "作废发票" : "撤销收款记录"} open={!!action} confirmLoading={busy} onCancel={() => !busy && setAction(null)} okText={action?.type === "void" ? "确认作废" : "确认撤销"} okButtonProps={{ danger: action?.type === "void", disabled: reasonInvalid }} cancelText="取消" destroyOnHidden
      onOk={() => { if (action && !reasonInvalid) void command({ action: action.type, ...(action.paymentId ? { paymentId: action.paymentId } : {}), reason }, action.type === "void" ? "发票已作废" : "收款记录已撤销"); }}>
      <p>{action?.type === "void" ? "原始发票和收款记录都会保留，并生成全额调整单。作废原因会显示在文件上，请用英文填写。" : "原收款记录会保留并标记为已撤销，已收金额相应扣除。"}</p>
      <Input.TextArea value={reason} maxLength={500} autoSize={{ minRows: 2, maxRows: 5 }} status={reasonRequired && nonEnglish(reason) ? "error" : undefined} placeholder={action?.type === "void" ? "例如 Issued to the wrong customer" : "例如 录错了发票"} onChange={e => setReason(e.target.value)} />
      {reasonRequired && nonEnglish(reason) && <small className="invoice-field-hint">作废原因会显示在英文文件上，请用英文填写</small>}
    </Modal>
  </>;
}

export function Catalog({ kind, data, refresh }: { kind: "customers" | "items"; data: Bootstrap; refresh: () => Promise<void> }) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState<{ id: string; version: number; isNew: boolean } | null>(null), [search, setSearch] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [form] = Form.useForm(); const customers = kind === "customers";
  const rows = customers ? data.customers : data.items;
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.trim().toLowerCase()));
  function edit(row?: CustomerEntry | PresetEntry) {
    setError(""); setEditing(row ? { id: row.id, version: row.version, isNew: false } : { id: uid(), version: 0, isNew: true });
    form.resetFields();
    if (row) { const { id: _id, version: _version, ...values } = row; void _id; void _version; form.setFieldsValue(values); }
    else form.setFieldsValue(customers ? emptyCustomer : { label: "", description: "", quantity: "1", unit: "job", unitPrice: "" });
  }
  async function save(values: Customer | Preset) {
    if (!editing) return; setBusy(true); setError("");
    try { await api(`${kind}/${editing.id}`, { data: values, version: editing.version }); await refresh(); setEditing(null); message.success("已保存"); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  async function remove(row: CustomerEntry | PresetEntry) {
    try { await api(`${kind}/${row.id}`, { version: row.version }, "DELETE"); await refresh(); message.success("已删除"); }
    catch (e) { message.error(errorText(e)); }
  }
  return <><div className="invoice-section-heading"><div><h1>{customers ? "客户" : "常用项目"}</h1><p>{customers ? "保存常用客户，开票时一键带入。修改不会影响已开出的发票。" : "中文查找，英文出单。单价留空时在开票时填写。"}</p></div><Button type="primary" onClick={() => edit()}>＋ {customers ? "新增客户" : "新增项目"}</Button></div>
    {rows.length > 0 && <Input.Search className="invoice-catalog-search" placeholder={customers ? "搜索客户名称、地址、电话" : "搜索中文名称或英文描述"} allowClear value={search} onChange={e => setSearch(e.target.value)} />}
    {!rows.length && <Empty description={customers ? "还没有常用客户。开票时也可以直接点“保存为常用客户”。" : "还没有常用项目"}><Button type="primary" onClick={() => edit()}>{customers ? "新增客户" : "新增项目"}</Button></Empty>}
    {rows.length > 0 && !shown.length && <Empty description="没有找到匹配的记录" />}
    <div className="invoice-catalog-list">{shown.map(r => <div className="invoice-catalog-row" key={r.id}><div><strong>{"name" in r ? r.name : r.label}</strong><p>{"name" in r ? [r.billingAddress, r.phone, r.email].filter(Boolean).join(" · ") || "未填写地址和联系方式" : r.description}</p>{"unitPrice" in r && <small>{r.unitPrice ? `${aud(cents(r.unitPrice))} / ${r.unit}（不含 GST）` : `开票时填价 / ${r.unit}`}</small>}</div><Space><Button onClick={() => edit(r)}>编辑</Button><Popconfirm title={`删除“${"name" in r ? r.name : r.label}”？`} description="只删除常用资料，已开出的发票不受影响。" okText="删除" okButtonProps={{ danger: true }} cancelText="取消" onConfirm={() => remove(r)}><Button danger type="text">删除</Button></Popconfirm></Space></div>)}</div>
    <Modal title={`${editing?.isNew ? "新增" : "编辑"}${customers ? "客户" : "常用项目"}`} open={!!editing} onCancel={() => !busy && setEditing(null)} confirmLoading={busy} onOk={() => form.submit()} okText="保存" cancelText="取消" destroyOnHidden>{error && <Alert className="invoice-alert" type="error" title={error} />}<Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
      {customers ? <><Form.Item name="name" label="客户姓名 / 公司名称（英文）" rules={[{ required: true, message: "请输入客户名称" }]}><Input /></Form.Item><Form.Item name="billingAddress" label="账单地址（英文，选填）"><Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} /></Form.Item><div className="invoice-fields"><Form.Item name="phone" label="电话（选填）"><Input type="tel" /></Form.Item><Form.Item name="email" label="邮箱（选填）" rules={[{ type: "email", message: "邮箱格式不正确" }]}><Input type="email" /></Form.Item></div><Form.Item name="abn" label="ABN（选填）"><Input inputMode="numeric" /></Form.Item></>
        : <><Form.Item name="label" label="中文快捷名称" rules={[{ required: true, message: "请输入中文名称，方便开票时搜索" }]}><Input placeholder="例如 防水" /></Form.Item><Form.Item name="description" label="英文施工描述（显示在发票上）" rules={[{ required: true, message: "请输入英文描述" }]}><Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} placeholder="例如 Waterproofing" /></Form.Item><div className="invoice-line-numbers"><Form.Item name="quantity" label="默认数量" getValueFromEvent={e => numberInput(e.target.value)}><Input inputMode="decimal" /></Form.Item><Form.Item name="unit" label="单位"><Select options={["m²", "m", "each", "job", "hour", "day"].map(value => ({ value, label: value }))} /></Form.Item><Form.Item name="unitPrice" label="单价（不含 GST，可留空）" getValueFromEvent={e => numberInput(e.target.value, 2)}><Input inputMode="decimal" prefix="$" /></Form.Item></div></>}
    </Form></Modal></>;
}

export function CompanySettings({ data, refresh }: { data: Bootstrap; refresh: () => Promise<void> }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Company>(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => form.setFieldsValue(data.settings.company), [data.settings.company, form]);
  async function save(company: Company) {
    setBusy(true); setError("");
    try { await api("settings", { company, version: data.settings.version }); await refresh(); message.success("设置已保存，之后开出的发票会使用新资料"); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <><div className="invoice-section-heading"><div><h1>公司与开票设置</h1><p>用于之后开出的发票，已开出的发票保持不变。</p></div></div><section className="invoice-panel invoice-settings">{error && <Alert className="invoice-alert" type="error" title={error} />}{!data.settings.company.verified && <Alert className="invoice-alert" type="info" title="填写并核实以下资料后，才能正式开票。" />}<Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
    <Form.Item name="name" label="公司法定名称（英文）" rules={[{ required: true, message: "请输入公司名称" }]} extra="与 ABN 登记一致，例如 LITA CONTRACTION PTY LTD"><Input /></Form.Item><Form.Item name="abn" label="ABN" extra="11 位数字，空格可有可无"><Input inputMode="numeric" /></Form.Item><Form.Item name="address" label="公司地址（英文）" extra="可以分两行填写，例如：55 Blackman Cres / Macquarie ACT 2614"><Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item><div className="invoice-fields"><Form.Item name="email" label="邮箱"><Input type="email" /></Form.Item><Form.Item name="phone" label="电话"><Input type="tel" /></Form.Item></div>
    <h2>收款账户</h2><Form.Item name="bankAccountName" label="账户名称（英文）"><Input /></Form.Item><div className="invoice-fields"><Form.Item name="bsb" label="BSB" extra="6 位数字，例如 032-778"><Input inputMode="numeric" /></Form.Item><Form.Item name="bankAccountNumber" label="账号"><Input inputMode="numeric" /></Form.Item></div>
    <Form.Item name="gstRegistered" valuePropName="checked"><Checkbox>公司已登记 GST，所有项目按不含 GST 价格另加 10% GST</Checkbox></Form.Item><Form.Item name="verified" valuePropName="checked"><Checkbox>我已核实公司名称、ABN、GST 登记状态和收款账户</Checkbox></Form.Item><Button type="primary" htmlType="submit" size="large" loading={busy}>保存设置</Button>
  </Form></section></>;
}
