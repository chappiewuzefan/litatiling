"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Modal, Space, Spin } from "antd";
import { errorText } from "./client";

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
export function ExportButtons({ url, name, label = "导出" }: { url: string; name: string; label?: string }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const urls = useRef<string[]>([]);
  const revoke = () => { urls.current.forEach(URL.revokeObjectURL); urls.current = []; };
  useEffect(() => () => { urls.current.forEach(URL.revokeObjectURL); }, []);
  async function prepare(images: boolean) {
    setOpen(true); setBusy(true); setError(""); revoke(); setFiles([]);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error((await response.json()).error || "文件生成失败，请重试");
      const buffer = await response.arrayBuffer();
      const results = images ? await imagesFromPdf(buffer, name) : [new File([buffer], `${name}.pdf`, { type: "application/pdf" })];
      setFiles(results.map(file => { const u = URL.createObjectURL(file); urls.current.push(u); return { file, url: u }; }));
      // Desktop downloads immediately; mobile can use the prepared files with a fresh share gesture.
      if (!images && !/iPhone|iPad|Android/i.test(navigator.userAgent)) {
        const a = document.createElement("a"); a.href = urls.current[0]; a.download = results[0].name; a.click();
      }
    } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  const canShare = files.length > 0 && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: files.map(f => f.file) });
  return <>
    <Space wrap><Button onClick={() => void prepare(false)}>{label} PDF</Button><Button onClick={() => void prepare(true)}>{label}图片</Button></Space>
    <Modal title="英文发票文件" open={open} onCancel={() => { setOpen(false); revoke(); setFiles([]); }} footer={null} destroyOnHidden>
      {busy && <Spin tip="正在准备文件…"><div style={{ height: 80 }} /></Spin>}
      {error && <Alert type="error" title={error} />}
      {!busy && files.length > 0 && <Space orientation="vertical" style={{ width: "100%" }}>
        <p>文件已准备好。可以保存后转发，或使用系统分享。</p>
        {canShare && <Button type="primary" size="large" onClick={() => { void navigator.share({ files: files.map(f => f.file) }).catch(e => { if (e.name !== "AbortError") setError("此浏览器暂不支持分享，请使用下面的保存或打开按钮。"); }); }}>分享文件</Button>}
        {files.map((f, i) => <Space key={f.file.name} wrap><a className="invoice-download" href={f.url} download={f.file.name}>保存{files.length > 1 ? `第 ${i + 1} 页` : "文件"}</a><a className="invoice-download" href={f.url} target="_blank" rel="noreferrer">打开{files.length > 1 ? `第 ${i + 1} 页` : "文件"}</a></Space>)}
        <small>微信内无法保存时，请在系统浏览器中打开。多页图片请逐页保存。</small>
      </Space>}
    </Modal>
  </>;
}
