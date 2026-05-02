"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Image, Spin } from "antd";
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useLostStatus } from "../hooks/useLostStatus";
import styles from "./LostStatus.module.css";

export default function LostStatus() {
  const { t } = useTranslation();
  const {
    items,
    isLoading,
    loadedImages,
    loadingIds,
    handleShowImage,
    handleHideImage,
  } = useLostStatus();

  return (
    <CardBase title={t("CardTitles.LOST_FOUND")}>
      <CardInside>
        {isLoading ? (
          <SubList>
            <p className={styles.loadingText}>{t("Common.Loading")}</p>
          </SubList>
        ) : (
          <div className={styles.listContainer}>
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
                      <div className={styles.itemWrapper}>
                        <div className={styles.itemHeader}>
                          <p className={styles.itemName}>{item.name}</p>
                          <p className={styles.itemTime}>
                            {dayjs(item.created_at).format("H:mm")}
                          </p>
                        </div>
                        <div className={styles.itemInfoRow}>
                          <p className={styles.itemPlace}>
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
                              className={styles.showImageBtn}
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
                          <div className={styles.imageContainer}>
                            <Image
                              src={loadedImages[item.id]}
                              alt={item.name}
                              className={styles.lostImage}
                              placeholder={<Spin />}
                            />
                          </div>
                        )}
                      </div>
                    </SubList>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.noDataContainer}>
                  <SubList>
                    <p className={styles.noDataText}>
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
