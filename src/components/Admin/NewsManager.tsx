"use client";

import React, { useState } from "react";
import { Input, Button, App, Modal, Spin } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { api, NewsItem } from "@/lib/Server/api";
import { useData } from "@/contexts/DataContext";
import dayjs from "dayjs";
import "@/components/Admin/Admin.css";

export default function NewsManager() {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editReason, setEditReason] = useState("");

  const news = fetchedData?.news || [];

  const handlePost = async () => {
    if (!title || !content) {
      message.warning("タイトルと内容を入力してください");
      return;
    }
    setLoading(true);
    try {
      await api.news.post(title, content);
      message.success("ニュースを配信しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setTitle("");
      setContent("");
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    modal.confirm({
      title: "ニュースの削除 (確認)",
      content: (
        <div style={{ marginTop: "10px" }}>
          <p style={{ marginBottom: "10px" }}>このニュースを削除します</p>
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
            {title}
          </div>
        </div>
      ),
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: async () => {
        try {
          await api.news.delete(id);
          message.success("削除しました");
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const startEdit = (item: NewsItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditReason("");
  };

  const handleUpdate = async () => {
    if (!editTitle || !editContent || !editReason) {
      message.warning("すべての項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      await api.news.update(editingItem!.id, {
        title: editTitle,
        content: editContent,
        reason: editReason,
      });
      message.success("編集しました");
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="News Manager (Admin)">
        <CardInside>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  return (
    <CardBase title="News Manager (Admin)">
      <CardInside>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "10%" }}>
          <p className="section-text" style={{ fontWeight: "bold", textAlign: "left" }}>
            新規配信
          </p>
          <Input
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="large"
          />
          <Input.TextArea
            placeholder="内容"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            size="large"
          />
          <Button
            type={isSuccess ? "default" : "primary"}
            block
            onClick={handlePost}
            loading={loading}
            disabled={isSuccess}
            className="main-push-btn"
            size="large"
          >
            {isSuccess ? "配信完了！" : "配信する"}
          </Button>
        </div>

        <p className="section-text" style={{ fontWeight: "bold", textAlign: "left" }}>
          配信済みニュース
        </p>
        {news.length > 0 ? (
          news.map((item, index) => (
            <React.Fragment key={item.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <div
                key={item.id}
                style={{
                  textAlign: "left",
                  marginTop: "1%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "16px", margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: "16px", color: "var(--text-sub-color)", margin: 0 }}>
                    {dayjs(item.created_at).format("H:mm")}
                  </p>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-sub-color)", margin: "4px 0" }}>
                  {item.content}
                </p>
                {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <Button onClick={() => startEdit(item)}>編集</Button>
                  <Button danger onClick={() => handleDelete(item.id, item.title)}>
                    削除
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "20px" }}>
            配信済みのニュースはありません
          </p>
        )}
        <Modal
          title="ニュースの編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          okText="編集を反映"
          cancelText="キャンセル"
          confirmLoading={loading}
          getContainer={() => document.getElementById("app-root") || document.body}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "10px" }}>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・タイトル</p>
              <Input
                size="large"
                placeholder="タイトル"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・本文</p>
              <Input.TextArea
                size="large"
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・編集理由</p>
              <Input
                size="large"
                placeholder="編集理由 (必須)"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      </CardInside>
    </CardBase>
  );
}
