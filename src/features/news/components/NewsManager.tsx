"use client";

import React from "react";
import { Input, Button, Modal, Spin } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useNewsManager } from "@/features/news/hooks/useNewsManager";
import styles from "./NewsManager.module.css";
import "@/features/admin/components/Admin.css";

import AdminEditModal from "@/features/admin/components/AdminEditModal";

export default function NewsManager() {
  const {
    news,
    isLoading,
    fetchedData,
    title,
    setTitle,
    content,
    setContent,
    loading,
    isSuccess,
    editingItem,
    setEditingItem,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editReason,
    setEditReason,
    handlePost,
    handleDelete,
    startEdit,
    handleUpdate,
  } = useNewsManager();

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="News Manager (Admin)">
        <CardInside>
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  return (
    <CardBase title="News Manager (Admin)">
      <CardInside>
        <div className={styles.formContainer}>
          <p className={`${styles.sectionTitle} section-text`}>新規配信</p>
          <Input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} size="large" />
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

        <p className={`${styles.sectionTitle} section-text`}>配信済みニュース</p>
        {news.length > 0 ? (
          news.map((item, index) => (
            <React.Fragment key={item.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <div className={styles.newsItemContainer}>
                <div className={styles.newsItemHeader}>
                  <p className={styles.newsItemTitle}>{item.title}</p>
                  <p className={styles.newsItemTime}>{dayjs(item.created_at).format("H:mm")}</p>
                </div>
                <p className={styles.newsItemContent}>{item.content}</p>
                {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}
                <div className={styles.buttonContainer}>
                  <Button onClick={() => startEdit(item)}>編集</Button>
                  <Button danger onClick={() => handleDelete(item.id, item.title)}>
                    削除
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p className={styles.noDataText}>配信済みのニュースはありません</p>
        )}

        <AdminEditModal
          title="ニュースの編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          confirmLoading={loading}
          editReason={editReason}
          setEditReason={setEditReason}
        >
          <div>
            <p className={styles.modalLabel}>・タイトル</p>
            <Input
              size="large"
              placeholder="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div>
            <p className={styles.modalLabel}>・本文</p>
            <Input.TextArea
              size="large"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </div>
        </AdminEditModal>
      </CardInside>
    </CardBase>
  );
}
