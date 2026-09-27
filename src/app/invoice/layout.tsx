import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./invoice.css";

export const metadata: Metadata = {
  title: "LITA 内部开票", description: "LITA 内部发票工作台",
  robots: { index: false, follow: false }, alternates: { canonical: null, languages: {} },
};
export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <div lang="zh-CN" className="invoice-app"><AntdRegistry>{children}</AntdRegistry></div>;
}
