"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Modal, Space, Spin } from "antd";
import { errorText, sessionExpiredEvent } from "./client";

async function imagesFromPdf(buffer: ArrayBuffer, name: string) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  const files: File[] = [];
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器无法生成图片，请下载 PDF");
      await page.render({ canvasContext: context, canvas, viewport }).promise;
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("图片生成失败")), "image/png"));
      files.push(new File([blob], `${name}-page-${n}.png`, { type: "image/png" }));
      canvas.width = 0; canvas.height = 0; page.cleanup();
    }
  } finally { await pdf.destroy(); }
  return files;
}
type ExportProps = { url: string; name: string; label?: string; primary?: boolean; size?: "small" | "middle" | "large" };
export function ExportButtons({ url, name, label = "导出 / 分享", primary = false, size = "middle" }: ExportProps) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const urls = useRef<string[]>([]), controller = useRef<AbortController | null>(null);
  const revoke = () => { urls.current.forEach(URL.revokeObjectURL); urls.current = []; };
  useEffect(() => () => { urls.current.forEach(URL.revokeObjectURL); }, []);
  async function prepare(images: boolean) {
    setBusy(true); setError(""); revoke(); setFiles([]);
    const abort = new AbortController(); controller.current = abort;
    try {
      const response = await fetch(url, { cache: "no-store", signal: abort.signal });
      if (response.status === 401) window.dispatchEvent(new Event(sessionExpiredEvent));
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "文件生成失败，请重试");
      const buffer = await response.arrayBuffer();
      const results = images ? await imagesFromPdf(buffer, name) : [new File([buffer], `${name}.pdf`, { type: "application/pdf" })];
      if (abort.signal.aborted) return;
      setFiles(results.map(file => { const u = URL.createObjectURL(file); urls.current.push(u); return { file, url: u }; }));
    } catch (e) { if (!abort.signal.aborted) setError(errorText(e)); } finally { if (controller.current === abort) { controller.current = null; setBusy(false); } }
  }
  // Closing also cancels a slow download so the dialog never traps the user.
  const close = () => { controller.current?.abort(); controller.current = null; setBusy(false); setOpen(false); revoke(); setFiles([]); setError(""); };
  const canShare = files.length > 0 && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: files.map(f => f.file) });
  return <>
    <Button type={primary ? "primary" : "default"} size={size} onClick={() => setOpen(true)}>{label}</Button>
    <Modal title="导出英文发票" open={open} onCancel={close} footer={null} destroyOnHidden>
      {!files.length && !busy && <div className="invoice-export-choices">
        <button type="button" onClick={() => void prepare(false)}><strong>PDF 文件</strong><span>推荐。A4 排版，文字可搜索，适合邮件和打印。</span></button>
        <button type="button" onClick={() => void prepare(true)}><strong>图片（PNG）</strong><span>适合微信直接发送。多页发票会生成多张图片。</span></button>
      </div>}
      {busy && <div className="invoice-export-busy"><Spin /> <span>正在生成文件…</span></div>}
      {error && <Alert type="error" title={error} action={<Button size="small" onClick={() => setError("")}>重新选择</Button>} />}
      {!busy && files.length > 0 && <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        {canShare && <Button block type="primary" size="large" onClick={() => { void navigator.share({ files: files.map(f => f.file) }).catch(e => { if (e.name !== "AbortError") setError("此浏览器暂不支持分享，请使用下面的保存或打开。"); }); }}>分享给客户</Button>}
        {files.map((f, i) => <div className="invoice-export-file" key={f.file.name}><span>{files.length > 1 ? `第 ${i + 1} 页` : f.file.name}</span><Space><a className="invoice-download" href={f.url} download={f.file.name}>保存</a><a className="invoice-download" href={f.url} target="_blank" rel="noreferrer">打开</a></Space></div>)}
        <Button type="link" onClick={() => { revoke(); setFiles([]); }}>换一种格式</Button>
        <small>在微信里无法保存时，请点右上角用系统浏览器打开。</small>
      </Space>}
    </Modal>
  </>;
}
