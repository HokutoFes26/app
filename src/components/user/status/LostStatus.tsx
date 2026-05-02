"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Image, Spin } from "antd";
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useData } from "@/contexts/DataContext";
import { api } from "@/lib/Server/api";
import { motion, AnimatePresence } from "framer-motion";

export default function LostStatus() {
  const { t } = useTranslation();
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

  return (
    <CardBase title={t("CardTitles.LOST_FOUND")}>
      <CardInside>
        {isLoading ? (
          <SubList>
            <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>{t("Common.Loading")}</p>
          </SubList>
        ) : (
          <div style={{ position: "relative" }}>
            <AnimatePresence initial={false}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{
                      delay: index * 0.04,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {index !== 0 && <Divider margin="20px 0" height="0px" />}
                    <SubList>
                      <div style={{ textAlign: "left", width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 4px 0" }}>{item.name}</p>
                          <p style={{ fontSize: "16px", color: "var(--text-sub-color)", margin: 0 }}>
                            {dayjs(item.created_at).format("H:mm")}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p style={{ fontSize: "14px", color: "var(--text-sub-color)", margin: 0 }}>
                            場所: {item.place}
                          </p>
                          {item.photo_path && (
                            <Button
                              type="link"
                              size="small"
                              icon={<PhotoRoundedIcon />}
                              loading={loadingIds[item.id]}
                              onClick={() =>
                                loadedImages[item.id]
                                  ? handleHideImage(item.id)
                                  : handleShowImage(item.id, item.photo_path!)
                              }
                              style={{ padding: 0, height: "auto" }}
                            >
                              {loadedImages[item.id]
                                ? t("Common.HideImage", "画像を隠す")
                                : t("LostFound.ShowImage", "画像を表示")}
                            </Button>
                          )}
                        </div>
                        {item.edit_reason && (
                          <p className="edited-text">
                            {t("Common.Edited")}: {item.edit_reason}
                          </p>
                        )}
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
                      </div>
                    </SubList>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px 0" }}>
                  <SubList>
                    <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>
                      {t("LostFound.NoData")}
                    </p>
                  </SubList>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardInside>
    </CardBase>
  );
}
