"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, App, Modal, Spin } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { mockSupabase, Question } from "@/lib/Server/mockSupabase";
import { useData } from "@/contexts/DataContext";
import "@/components/Admin/Admin.css";
import "@/styles/global-app.css";

export default function QAManager() {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<Question | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [editReason, setEditReason] = useState("");

  const questions = fetchedData?.questions || [];

  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleReply = async (id: string) => {
    const answer = replies[id];
    if (!answer) {
      message.warning("回答を入力してください");
      return;
    }

    setLoading(true);
    try {
      await mockSupabase.qa.reply(id, answer);
      message.success("回答を送信しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setReplies((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, text: string) => {
    modal.confirm({
      title: "削除の確認",
      content: (
        <div style={{ marginTop: "10px" }}>
          <p style={{ marginBottom: "10px" }}>この質問を削除してもよろしいですか？</p>
          <div
            style={{
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#666",
              border: "1px solid #ddd",
            }}
          >
            {text}
          </div>
        </div>
      ),
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: async () => {
        try {
          await mockSupabase.qa.delete(id);
          message.success("削除しました");
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const startEdit = (item: Question) => {
    setEditingItem(item);
    setEditAnswer(item.answer || "");
    setEditReason("");
  };

  const handleUpdate = async () => {
    if (!editAnswer || !editReason) {
      message.warning("回答と編集理由をすべて入力してください");
      return;
    }
    const id = editingItem!.id;
    setLoading(true);
    try {
      await mockSupabase.qa.reply(id, editAnswer, editReason);
      message.success("編集しました");
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="Q & A Manager (Admin)">
        <CardInside>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  const pendingQuestions = questions.filter((q) => !q.answer);
  const answeredQuestions = questions.filter((q) => q.answer);

  return (
    <CardBase title="Q & A Manager (Admin)">
      <CardInside>
        <p className="section-text" style={{ fontWeight: "bold", textAlign: "left" }}>
          未回答の質問 ({pendingQuestions.length}件)
        </p>
        {pendingQuestions.length > 0 ? (
          pendingQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              {index !== 0 && <Divider />}
              <div style={{ textAlign: "left", padding: "20px 0" }}>
                <h4 style={{ margin: "0 0 10px 0", whiteSpace: "normal" }}>{q.text}</h4>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <Input
                    placeholder="回答を入力..."
                    value={replies[q.id] || ""}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                  <Button
                    type={isSuccess ? "default" : "primary"}
                    onClick={() => handleReply(q.id)}
                    className="main-push-btn"
                    loading={loading}
                    disabled={isSuccess}
                  >
                    {isSuccess ? "返信完了！" : "返信"}
                  </Button>
                </div>
                <Button size="small" danger onClick={() => handleDelete(q.id, q.text)}>
                  削除
                </Button>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "20px" }}>
            未回答の質問はありません
          </p>
        )}
        <p className="section-text" style={{ fontWeight: "bold" }}>
          回答済みの質問 ({answeredQuestions.length}件)
        </p>
        {answeredQuestions.length > 0 ? (
          answeredQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              <div
                key={q.id}
                style={{
                  textAlign: "left",
                  padding: "15px",
                  background: "var(--mainCanvas-color)",
                  borderRadius: "8px",
                  marginTop: "5%",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "#666" }}>
                    <span style={{ color: "#007AFF", marginRight: "8px" }}>Q:</span>
                    {q.text}
                  </p>
                  <p style={{ fontSize: "11px", color: "#666", whiteSpace: "pre-wrap" }}>
                    <span style={{ color: "#ff4d4f", marginRight: "8px" }}>A:</span>
                    {q.answer}
                  </p>
                  {q.edit_reason && <p className="edited-text">編集済み: {q.edit_reason}</p>}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
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
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "20px" }}>
            回答済みの質問はありません
          </p>
        )}
        <Modal
          title="回答の編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          okText="更新"
          cancelText="キャンセル"
          confirmLoading={loading}
          getContainer={() => document.getElementById("app-root") || document.body}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "10px" }}>
            <div>
              <p style={{ fontSize: "12px" }}>・質問</p>
              <p>{editingItem?.text}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・回答</p>
              <Input.TextArea
                rows={3}
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                size="large"
              />
            </div>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・編集理由 (必須)</p>
              <Input value={editReason} onChange={(e) => setEditReason(e.target.value)} size="large" />
            </div>
          </div>
        </Modal>
      </CardInside>
    </CardBase>
  );
}
