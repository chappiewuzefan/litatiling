"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, ConfigProvider, Form, Input, Spin } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { InvoiceInput, InvoiceRecord } from "@/lib/invoice/domain";
import { api, errorText, setCsrf, type Bootstrap, type Detail } from "./client";
import { InvoiceEditor, type EditorHandle } from "./editor";
import { Catalog, CompanySettings, InvoiceDetail, InvoiceHistory } from "./management";

type Session = { authenticated: boolean; csrf: string; config: { apiKey: string; projectId: string; authDomain: string } | null };
type Screen = "new" | "history" | "customers" | "items" | "settings" | "detail" | "edit";
export function InvoiceApp() {
  const [session, setSession] = useState<Session | null>(null), [data, setData] = useState<Bootstrap | null>(null), [error, setError] = useState("");
  const [screen, setScreen] = useState<Screen>("history"), [selected, setSelected] = useState(""), [initial, setInitial] = useState<InvoiceRecord | undefined>(), [copy, setCopy] = useState<InvoiceInput | undefined>(), [editorKey, setEditorKey] = useState(0);
  const editor = useRef<EditorHandle>(null);
  const refresh = useCallback(async () => { const result = await api<Bootstrap>("bootstrap"); setData(result); }, []);
  const loadSession = useCallback(async () => {
    setError("");
    const result = await api<Session>("session"); setCsrf(result.csrf); setSession(result);
    if (result.authenticated) await refresh();
  }, [refresh]);
  useEffect(() => { void loadSession().catch(e => setError(errorText(e))); }, [loadSession]);
  async function navigate(next: Screen) {
    try {
      await editor.current?.flush(); setError("");
      if (next === "new") { setInitial(undefined); setCopy(undefined); setEditorKey(k => k + 1); }
      setScreen(next);
    } catch (e) { setError(errorText(e)); }
  }
  function open(id: string) { setSelected(id); setScreen("detail"); }
  function edit(record: InvoiceRecord) { setInitial(record); setCopy(undefined); setEditorKey(k => k + 1); setScreen("edit"); }
  function duplicate(input: InvoiceInput) { setInitial(undefined); setCopy(input); setEditorKey(k => k + 1); setScreen("new"); }
  async function reloadEditor() {
    if (initial) { const detail = await api<Detail>(`records/${initial.id}`); if (detail.invoice.status === "draft") edit(detail.invoice); else open(initial.id); }
    else { setScreen("history"); }
    setError("");
  }
  async function logout() {
    try { await editor.current?.flush(); await api("session", {}, "DELETE"); setData(null); await loadSession(); } catch (e) { setError(errorText(e)); }
  }
  const active = screen === "detail" || screen === "edit" ? "history" : screen;
  return <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#234d48", borderRadius: 8, fontSize: 15, controlHeight: 42, colorBgLayout: "#f4f6f7", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif' } }}>
    <div className="invoice-shell"><header className="invoice-header"><div className="invoice-wordmark">LITA <span>内部开票</span></div>{session?.authenticated && <Button type="text" onClick={() => void logout()}>退出登录</Button>}</header>
      {error && <div className="invoice-global-error"><Alert type="error" title={error} action={<Button onClick={() => void loadSession().catch(e => setError(errorText(e)))}>重新连接</Button>} /></div>}
      {!session && !error && <div className="invoice-loading"><Spin size="large" /></div>}
      {session && !session.authenticated && <Login session={session} onLogin={loadSession} />}
      {session?.authenticated && !data && !error && <div className="invoice-loading"><Spin /></div>}
      {session?.authenticated && data && <><nav className="invoice-nav" aria-label="开票导航">{([['new', '＋ 新建发票'], ['history', '历史发票'], ['customers', '客户'], ['items', '常用项目'], ['settings', '设置']] as [Screen, string][]).map(([key, label]) => <button key={key} aria-current={active === key ? "page" : undefined} onClick={() => void navigate(key)}>{label}</button>)}</nav><main className="invoice-main">
        {(screen === "new" || screen === "edit") && <InvoiceEditor ref={editor} key={editorKey} data={data} initial={initial} copy={copy} onDone={open} onDeleted={() => { setInitial(undefined); setCopy(undefined); setScreen("history"); }} onReload={() => void reloadEditor().catch(e => setError(errorText(e)))} refresh={refresh} />}
        {screen === "history" && <InvoiceHistory onOpen={open} />}
        {screen === "detail" && <InvoiceDetail key={selected} id={selected} onEdit={edit} onCopy={duplicate} onDeleted={() => setScreen("history")} />}
        {(screen === "customers" || screen === "items") && <Catalog key={screen} kind={screen} data={data} refresh={refresh} />}
        {screen === "settings" && <CompanySettings data={data} refresh={refresh} />}
      </main></>}
    </div>
  </ConfigProvider>;
}

function Login({ session, onLogin }: { session: Session; onLogin: () => Promise<void> }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function login(values: { email: string; password: string }) {
    if (!session.config) return;
    setBusy(true); setError("");
    try {
      const [{ initializeApp, getApps }, { getAuth, signInWithEmailAndPassword, setPersistence, inMemoryPersistence, signOut }] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
      const app = getApps().find(a => a.name === "invoice-login") || initializeApp(session.config, "invoice-login");
      const auth = getAuth(app); await setPersistence(auth, inMemoryPersistence);
      try { const credential = await signInWithEmailAndPassword(auth, values.email, values.password); await api("session", { idToken: await credential.user.getIdToken() }); }
      finally { await signOut(auth); }
      await onLogin();
    } catch (e) {
      const message = errorText(e);
      setError(message.includes("auth/") ? "登录失败，请检查邮箱和密码，或稍后重试。" : message);
    } finally { setBusy(false); }
  }
  return <main className="invoice-login"><div className="invoice-login-intro"><span>INVOICES, MADE SIMPLE</span><h1>开好一张发票，<br />继续忙手上的事。</h1><p>客户、施工项目、收款和历史记录，<br />都在一个地方。</p></div><section className="invoice-panel"><h2>内部人员登录</h2><p>请使用公司共享账号。</p>{!session.config && <Alert type="info" title="内部登录尚未启用，请联系管理员完成配置。" />}{error && <Alert type="error" title={error} />}<Form layout="vertical" onFinish={login}><Form.Item name="email" label="邮箱" rules={[{ required: true, type: "email" }]}><Input autoComplete="username" type="email" /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true }]}><Input.Password autoComplete="current-password" /></Form.Item><Button block type="primary" htmlType="submit" size="large" disabled={!session.config} loading={busy}>登录工作台</Button></Form></section></main>;
}
