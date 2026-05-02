"use client";

import React, { useState } from "react";
import { Input, Button, App, Modal, Spin, Upload, Image } from "antd";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import { api, LostItem } from "@/lib/Server/api";
import { useData } from "@/contexts/DataContext";
import { compressImage } from "@/lib/Misc/ImageUtils";
import dayjs from "dayjs";
import "@/components/Admin/Admin.css";

export default function LostManager() {
  const { message, modal } = App.useApp();
  const {
    api: { fetchedData, fetchData, isLoading },
  } = useData();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editFileList, setEditFileList] = useState<any[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const items = fetchedData?.lostItems || [];

  const handleShowImage = (id: string, path: string) => {
    if (loadedImages[id]) return;
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const publicUrl = api.storage.getPublicUrl(path);
      setLoadedImages((prev) => ({ ...prev, [id]: publicUrl }));
    } catch (e) {
      console.error("[LostManager] Image URL error:", e);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleHideImage = (id: string) => {
    const next = { ...loadedImages };
    delete next[id];
    setLoadedImages(next);
  };

  const handlePost = async () => {
    if (!name || !place) {
      message.warning("品名と場所を入力してください");
      return;
    }
    setLoading(true);
    try {
      let photo_path = undefined;
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        console.log("[LostManager] Compressing image...");
        const compressedBlob = await compressImage(file);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        const compressedFile = new File([compressedBlob], newFileName, { type: "image/jpeg" });
        const uploadRes = await api.storage.uploadImage(compressedFile);
        photo_path = uploadRes.path;
      }

      await api.lostAndFound.post({ name, place, photo_path });
      message.success("落とし物を登録しました");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
      setName("");
      setPlace("");
      setFileList([]);
      await fetchData();
    } catch (error) {
      console.error(error);
      message.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string, photoPath?: string) => {
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
      getContainer: () => document.getElementById("app-root") || document.body,
      onOk: async () => {
        try {
          await api.lostAndFound.delete(id, photoPath);
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
    setEditFileList([]);
  };

  const handleUpdate = async () => {
    if (!editName || !editPlace || !editReason) {
      message.warning("品名、場所、編集理由をすべて入力してください");
      return;
    }
    setLoading(true);
    try {
      let photo_path = editingItem?.photo_path;
      if (editFileList.length > 0) {
        const file = editFileList[0].originFileObj;
        console.log("[LostManager] Compressing image...");
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });

        const uploadRes = await api.storage.uploadImage(compressedFile);
        photo_path = uploadRes.path;
      }

      await api.lostAndFound.update(editingItem!.id, {
        name: editName,
        place: editPlace,
        reason: editReason,
        photo_path,
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
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "10%" }}>
          <p className="section-text" style={{ fontWeight: "bold", textAlign: "left" }}>
            新規登録
          </p>
          <Input placeholder="落とし物の名前" value={name} onChange={(e) => setName(e.target.value)} size="large" />
          <Input placeholder="落ちていた場所" value={place} onChange={(e) => setPlace(e.target.value)} size="large" />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "12px", color: "var(--text-sub-color)", marginBottom: "8px" }}>画像を追加 (任意)</p>
            <Upload
              listType="picture"
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<FileUploadRoundedIcon />}>写真を選択</Button>
            </Upload>
          </div>
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

        <p className="section-text" style={{ fontWeight: "bold", textAlign: "left" }}>
          登録済みアイテム
        </p>
        {items.length > 0 ? (
          items.map((item, index) => (
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
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <p style={{ fontWeight: "bold", margin: 0 }}>{item.name}</p>
                  </div>
                  <p style={{ fontSize: "16px", color: "var(--text-sub-color)", margin: 0 }}>
                    {dayjs(item.created_at).format("H:mm")}
                  </p>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}
                >
                  <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>場所: {item.place}</p>
                  {item.photo_path && (
                    <Button
                      type="link"
                      size="small"
                      icon={<PhotoRoundedIcon />}
                      loading={loadingIds[item.id]}
                      onClick={() =>
                        loadedImages[item.id] ? handleHideImage(item.id) : handleShowImage(item.id, item.photo_path!)
                      }
                      style={{ padding: 0, height: "auto" }}
                    >
                      {loadedImages[item.id] ? "画像を隠す" : "画像を表示"}
                    </Button>
                  )}
                </div>
                {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}

                {loadedImages[item.id] && (
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <Image
                      src={loadedImages[item.id]}
                      alt={item.name}
                      style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "200px", objectFit: "cover" }}
                      placeholder={<Spin />}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <Button onClick={() => startEdit(item)}>編集</Button>
                  <Button danger onClick={() => handleDelete(item.id, item.name, item.photo_path)}>
                    削除
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p style={{ fontSize: "14px", color: "#999", textAlign: "center", padding: "20px" }}>
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
          getContainer={() => document.getElementById("app-root") || document.body}
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
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>・写真を変更 (任意)</p>
              <Upload
                listType="picture"
                maxCount={1}
                fileList={editFileList}
                onChange={({ fileList }) => setEditFileList(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<FileUploadRoundedIcon />}>写真を選択</Button>
              </Upload>
              {editingItem?.photo_path && editFileList.length === 0 && (
                <p style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>現在登録されている写真があります</p>
              )}
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
