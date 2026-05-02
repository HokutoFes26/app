import { useState } from "react";
import { App } from "antd";
import { api, LostItem } from "@/lib/Server/api";
import { useData } from "@/contexts/DataContext";
import { compressImage } from "@/lib/Misc/ImageUtils";
import useAspectDetector from "@/hooks/useAspectDetector";

export const useLostManager = () => {
  const isMobile = useAspectDetector();
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
      content: "この落とし物情報を削除します",
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

  return {
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
  };
};
