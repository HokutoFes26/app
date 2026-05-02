"use client";

import React from "react";
import { Input, Button, Modal, Spin } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import "@/features/admin/components/Admin.css";
import "@/styles/global-app.css";
import { useQAManager } from "../hooks/useQAManager";
import styles from "./QAManager.module.css";

import AdminEditModal from "@/features/admin/components/AdminEditModal";

export default function QAManager() {
  const {
    fetchedData,
    isLoading,
    replies,
    setReplies,
    loading,
    isSuccess,
    editingItem,
    setEditingItem,
    editAnswer,
    setEditAnswer,
    editReason,
    setEditReason,
    pendingQuestions,
    answeredQuestions,
    handleReply,
    handleDelete,
    startEdit,
    handleUpdate,
  } = useQAManager();

  const handleReplyChange = (id: string, val: string) => {
    setReplies((prev) => ({ ...prev, [id]: val }));
  };

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="Q & A Manager (Admin)">
        <CardInside>
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  return (
    <CardBase title="Q & A Manager (Admin)">
      <CardInside>
        <p className={`section-text ${styles.sectionTitle}`}>
          未回答の質問 ({pendingQuestions.length}件)
        </p>
        {pendingQuestions.length > 0 ? (
          pendingQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <div className={styles.itemContainer}>
                <div className={styles.itemHeader}>
                  <p className={styles.questionText}>
                    <span className={styles.qPrefix}>Q:</span>
                    {q.text}
                  </p>
                  <p className={styles.itemTime}>
                    {dayjs(q.created_at).format("H:mm")}
                  </p>
                </div>
                <div className={styles.inputRow}>
                  <Input
                    placeholder="回答を入力..."
                    value={replies[q.id] || ""}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    size="large"
                  />
                  <Button
                    type={isSuccess ? "default" : "primary"}
                    onClick={() => handleReply(q.id)}
                    className="main-push-btn"
                    loading={loading}
                    disabled={isSuccess}
                    size="large"
                  >
                    {isSuccess ? "返信完了！" : "返信"}
                  </Button>
                </div>
                <Button danger onClick={() => handleDelete(q.id, q.text)}>
                  削除
                </Button>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p className={styles.noItemsText}>
            未回答の質問はありません
          </p>
        )}
        <p className={`section-text ${styles.sectionTitle}`}>
          回答済みの質問 ({answeredQuestions.length}件)
        </p>
        {answeredQuestions.length > 0 ? (
          answeredQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <div
                key={q.id}
                className={styles.answeredItemContainer}
              >
                <div>
                  <div className={styles.itemHeader}>
                    <p className={styles.questionText}>
                      <span className={styles.qPrefix}>Q:</span>
                      {q.text}
                    </p>
                    <p className={styles.itemTime}>
                      {dayjs(q.created_at).format("H:mm")}
                    </p>
                  </div>
                  <p className={styles.answerText}>
                    <span className={styles.aPrefix}>A:</span>
                    {q.answer}
                  </p>
                  {q.edit_reason && <p className="edited-text">編集済み: {q.edit_reason}</p>}
                  <div className={styles.actionButtons}>
                    <Button onClick={() => startEdit(q)}>編集</Button>
                    <Button danger onClick={() => handleDelete(q.id, q.text)}>
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p className={styles.noItemsText}>
            回答済みの質問はありません
          </p>
        )}
        
        <AdminEditModal
          title="回答の編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          confirmLoading={loading}
          editReason={editReason}
          setEditReason={setEditReason}
        >
          <div className={styles.modalForm}>
            <div>
              <p className={styles.modalLabel}>・質問</p>
              <p>{editingItem?.text}</p>
            </div>
            <div>
              <p className={styles.modalInputLabel}>・回答</p>
              <Input.TextArea
                rows={3}
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                size="large"
              />
            </div>
          </div>
        </AdminEditModal>
      </CardInside>
    </CardBase>
  );
}

