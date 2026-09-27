"use client";

import { useRef, useState } from "react";
import { Alert, Button, Modal } from "antd";
import type { InvoiceRecord } from "@/lib/invoice/domain";
import { createCommandSender, errorText } from "./client";

type Props = {
  // Returns the latest saved draft; the editor uses this to stop autosave before deleting.
  prepare: () => Promise<InvoiceRecord | undefined> | InvoiceRecord | undefined;
  onFailed?: () => void;
  onDeleted: () => void;
};

export function DeleteDraftButton({ prepare, onFailed, onDeleted }: Props) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const send = useRef(createCommandSender());
  async function remove() {
    setBusy(true); setError("");
    try {
      const record = await prepare();
      if (!record) { setOpen(false); onDeleted(); return; }
      await send.current({ action: "delete-draft", id: record.id, expectedVersion: record.lockVersion });
      setOpen(false); onDeleted();
    } catch (e) { setError(errorText(e)); onFailed?.(); }
    finally { setBusy(false); }
  }
  return <>
    <Button danger onClick={() => { setError(""); setOpen(true); }}>删除草稿</Button>
    <Modal title="删除草稿" open={open} onCancel={() => !busy && setOpen(false)} onOk={() => void remove()} confirmLoading={busy} okText="删除" okButtonProps={{ danger: true }} cancelText="取消">
      <p>删除后，这张草稿不会再出现在历史发票和导出清单中，且无法恢复。草稿还没有发票号，删除不影响编号。</p>
      {error && <Alert type="error" title={error} />}
    </Modal>
  </>;
}
