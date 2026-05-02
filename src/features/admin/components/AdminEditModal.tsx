import React from "react";
import { Modal, Input } from "antd";
import styles from "./AdminEditModal.module.css";

interface AdminEditModalProps {
  title: string;
  open: boolean;
  confirmLoading: boolean;
  onOk: () => void;
  onCancel: () => void;
  editReason: string;
  setEditReason: (val: string) => void;
  children: React.ReactNode;
}

export default function AdminEditModal({
  title,
  open,
  confirmLoading,
  onOk,
  onCancel,
  editReason,
  setEditReason,
  children,
}: AdminEditModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="編集を反映"
      cancelText="キャンセル"
      confirmLoading={confirmLoading}
      getContainer={() => document.getElementById("app-root") || document.body}
    >
      <div className={styles.modalBody}>
        {children}

        <div className={styles.reasonSection}>
          <p className={styles.modalLabel}>・編集理由 (必須)</p>
          <Input
            size="large"
            placeholder="編集理由を入力"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
