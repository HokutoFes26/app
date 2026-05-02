"use client";

import React from "react";
import { Input, Button, Modal, Spin, Upload, Image, Space } from "antd";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import "@/features/admin/components/Admin.css";
import { useLostManager } from "@/features/lost/hooks/useLostManager";
import styles from "./LostManager.module.css";

import AdminEditModal from "@/features/admin/components/AdminEditModal";

export default function LostManager() {
  const {
    isMobile,
    items,
    isLoading,
    fetchedData,
    name,
    setName,
    place,
    setPlace,
    loading,
    fileList,
    setFileList,
    isSuccess,
    editingItem,
    setEditingItem,
    editName,
    setEditName,
    editPlace,
    setEditPlace,
    editReason,
    setEditReason,
    editFileList,
    setEditFileList,
    loadedImages,
    loadingIds,
    handleShowImage,
    handleHideImage,
    handlePost,
    handleDelete,
    startEdit,
    handleUpdate,
  } = useLostManager();

  if (isLoading && !fetchedData) {
    return (
      <CardBase title="Lost Manager (Admin)">
        <CardInside>
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        </CardInside>
      </CardBase>
    );
  }

  return (
    <CardBase title="Lost Manager (Admin)">
      <CardInside>
        <div className={styles.formContainer}>
          <p className={`section-text ${styles.sectionTitle}`}>新規登録</p>
          <Input placeholder="落とし物の名前" value={name} onChange={(e) => setName(e.target.value)} size="large" />
          <Input placeholder="落ちていた場所" value={place} onChange={(e) => setPlace(e.target.value)} size="large" />
          <div className={styles.uploadSection}>
            <p className={styles.uploadLabel}>画像を追加 (任意)</p>
            <Space wrap>
              <Upload
                className="no-thumbnail-link"
                accept="image/*"
                listType="picture"
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                showUploadList={{ showPreviewIcon: false }}
              >
                {fileList.length === 0 && <Button icon={<FileUploadRoundedIcon />}>写真を選択</Button>}
              </Upload>
              {isMobile && fileList.length === 0 && (
                <Upload
                  className="no-thumbnail-link"
                  accept="image/*"
                  capture="environment"
                  listType="picture"
                  maxCount={1}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  showUploadList={false}
                >
                  <Button icon={<CameraAltRoundedIcon />}>カメラで撮影</Button>
                </Upload>
              )}
            </Space>
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

        <p className={`section-text ${styles.sectionTitle}`}>登録済みアイテム</p>
        {items.length > 0 ? (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index !== 0 && <Divider margin="20px 0" height="0px" />}
              <div key={item.id} className={styles.itemContainer}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemNameWrapper}>
                    <p className={styles.itemName}>{item.name}</p>
                  </div>
                  <p className={styles.itemTime}>{dayjs(item.created_at).format("H:mm")}</p>
                </div>
                <div className={styles.itemInfoRow}>
                  <p className={styles.itemPlace}>場所: {item.place}</p>
                  {item.photo_path && (
                    <Button
                      type="link"
                      size="small"
                      icon={<PhotoRoundedIcon />}
                      loading={loadingIds[item.id]}
                      onClick={() =>
                        loadedImages[item.id] ? handleHideImage(item.id) : handleShowImage(item.id, item.photo_path!)
                      }
                      className={styles.showImageBtn}
                    >
                      {loadedImages[item.id] ? "画像を隠す" : "画像を表示"}
                    </Button>
                  )}
                </div>
                {item.edit_reason && <p className="edited-text">編集済み: {item.edit_reason}</p>}

                {loadedImages[item.id] && (
                  <div className={styles.imageContainer}>
                    <Image
                      src={loadedImages[item.id]}
                      alt={item.name}
                      className={styles.lostImage}
                      placeholder={<Spin />}
                    />
                  </div>
                )}

                <div className={styles.actionButtons}>
                  <Button onClick={() => startEdit(item)}>編集</Button>
                  <Button danger onClick={() => handleDelete(item.id, item.name, item.photo_path)}>
                    削除
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <p className={styles.noItemsText}>登録されているアイテムはありません</p>
        )}

        <AdminEditModal
          title="落とし物の編集"
          open={!!editingItem}
          onOk={handleUpdate}
          onCancel={() => setEditingItem(null)}
          confirmLoading={loading}
          editReason={editReason}
          setEditReason={setEditReason}
        >
          <div className={styles.modalFields}>
            <div>
              <p className={styles.modalLabel}>・落とし物の名前</p>
              <Input size="large" placeholder="品名" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <p className={styles.modalLabel}>・落ちていた場所</p>
              <Input size="large" placeholder="場所" value={editPlace} onChange={(e) => setEditPlace(e.target.value)} />
            </div>
            <div>
              <p className={styles.modalLabel}>・写真を変更 (任意)</p>
              <Space wrap>
                <Upload
                  className="no-thumbnail-link"
                  accept="image/*"
                  listType="picture"
                  maxCount={1}
                  fileList={editFileList}
                  onChange={({ fileList }) => setEditFileList(fileList)}
                  beforeUpload={() => false}
                  showUploadList={{ showPreviewIcon: false }}
                >
                  {editFileList.length === 0 && <Button icon={<FileUploadRoundedIcon />}>写真を選択</Button>}
                </Upload>
                {isMobile && editFileList.length === 0 && (
                  <Upload
                    className="no-thumbnail-link"
                    accept="image/*"
                    capture="environment"
                    listType="picture"
                    maxCount={1}
                    fileList={editFileList}
                    onChange={({ fileList }) => setEditFileList(fileList)}
                    beforeUpload={() => false}
                    showUploadList={false}
                  >
                    <Button icon={<CameraAltRoundedIcon />}>カメラで撮影</Button>
                  </Upload>
                )}
              </Space>
              {editingItem?.photo_path && editFileList.length === 0 && (
                <p className={styles.existingPhotoText}>現在登録されている写真があります</p>
              )}
            </div>
          </div>
        </AdminEditModal>
      </CardInside>
    </CardBase>
  );
}
