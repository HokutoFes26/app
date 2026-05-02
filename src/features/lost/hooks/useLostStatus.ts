import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { api } from "@/lib/Server/api";

export const useLostStatus = () => {
  const {
    api: { fetchedData, isLoading },
  } = useData();
  const items = fetchedData?.lostItems || [];
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const handleShowImage = (id: string, path: string) => {
    if (loadedImages[id]) return;

    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const publicUrl = api.storage.getPublicUrl(path);
      setLoadedImages((prev) => ({ ...prev, [id]: publicUrl }));
    } catch (e) {
      console.error("[LostStatus] Image URL error:", e);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleHideImage = (id: string) => {
    const next = { ...loadedImages };
    delete next[id];
    setLoadedImages(next);
  };

  return {
    items,
    isLoading,
    loadedImages,
    loadingIds,
    handleShowImage,
    handleHideImage,
  };
};
