"use client";

import React, { useState } from "react";
import { Input, Button, App, Modal, Spin } from "antd";
import { CardBase, CardInside } from "@/components/Layout/CardComp";
import { mockSupabase, LostItem } from "@/lib/Server/mockSupabase";
import { useData } from "@/contexts/DataContext";
import "@/components/admin/admin.css";

export default function LostManager() {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [editReason, setEditReason] = useState("");

  const items = fetchedData?.lostItems || [];

  const handlePost = async () => {
    if (!name || !place) {
      message.warning("品名と場所を入力してください");
      return;
    }
    setLoading(true);
    try {
      await mockSupabase.lostAndFound.post({ name, place });
      message.success("落とし物を登録しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setName("");
      setPlace("");
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラー");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    modal.confirm({
      title: "落とし物の削除 (確認)",
      content: (
        <div style={{ marginTop: "10px" }}>
          <p style={{ marginBottom: "10px" }}>この落とし物情報を削除します</p>
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
            {name}
          </div>
        </div>
      ),
      getContainer: () => document.querySelector(".webapp-root") || document.body,
      onOk: async () => {
        try {
          await mockSupabase.lostAndFound.delete(id);
          message.success("削除しました");
          await fetchData();
        } catch (error) {
          console.error(error);
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const startEdit = (item: LostItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPlace(item.place);
    setEditReason("");
  };

  const handleUpdate = async () => {
    if (!editName || !editPlace || !editReason) {
      message.warning("品名、場所、編集理由をすべて入力してください");
      return;
    }
    setLoading(true);
    try {
      await mockSupabase.lostAndFound.update(editingItem!.id, {
        name: editName,
        place: editPlace,
        reason: editReason,
      });
      message.success("編集しました");
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラー");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="Lost Manager (Admin)">
        <CardInside>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  return (
    <CardBase title="Lost Manager (Admin)">
      <CardInside>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <p style={{ textAlign: "left", margin: 0 }}>新規登録</p>
          <Input placeholder="落とし物の名前" value={name} onChange={(e) => setName(e.target.value)} size="large" />
          <Input placeholder="落ちていた場所" value={place} onChange={(e) => setPlace(e.target.value)} size="large" />
          <Button
            type={isSuccess ? "default" : "primary"}
            block
            onClick={handlePost}
            loading={loading}
            disabled={isSuccess}
            className="main-push-btn"
            size="large"
          >
            {isSuccess ? "投稿完了！" : "落とし物を登録"}
          </Button>
        </div>
        <p style={{ textAlign: "left", margin: "20px 0 10px", paddingTop: "10%" }}>登録済みアイテム</p>
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                textAlign: "left",
                padding: "15px",
                background: "var(--mainCanvas-color)",
                borderRadius: "8px",
                marginTop: "5%",
              }}
            >
              <p style={{ fontWeight: "bold", margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>場所: {item.place}</p>
              {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <Button onClick={() => startEdit(item)}>編集</Button>
                <Button danger onClick={() => handleDelete(item.id, item.name)}>
                  削除
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "12px", color: "#999", textAlign: "center", padding: "20px" }}>
            登録されているアイテムはありません
          </p>
        )}
        <Modal
          title="落とし物の編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          okText="更新"
          cancelText="キャンセル"
          confirmLoading={loading}
          getContainer={() => document.querySelector(".webapp-root") || document.body}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "10px" }}>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・落とし物の名前</p>
              <Input size="large" placeholder="品名" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・落ちていた場所</p>
              <Input size="large" placeholder="場所" value={editPlace} onChange={(e) => setEditPlace(e.target.value)} />
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
