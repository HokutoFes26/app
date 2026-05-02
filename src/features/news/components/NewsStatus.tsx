"use client";

import React from "react";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsStatus } from "@/features/news/hooks/useNewsStatus";
import styles from "./NewsStatus.module.css";

export default function NewsStatus({ onlyHot = false, hotTime = 10 }: { onlyHot?: boolean; hotTime?: number }) {
  const { t } = useTranslation();
  const { isLoading, processedNews } = useNewsStatus(onlyHot, hotTime);

  if (onlyHot && processedNews.length === 0) return null;

  return (
    <CardBase
      title={onlyHot ? `${t("CardTitles.NEWS")} / ${t("Time.HotNews", { count: hotTime })}` : t("CardTitles.NEWS")}
    >
      <CardInside>
        {isLoading ? (
          <SubList>
            <p className={styles.loadingText}>Loading...</p>
          </SubList>
        ) : (
          <div className={styles.newsContainer}>
            <AnimatePresence initial={false}>
              {processedNews.length > 0 ? (
                processedNews.map((item, index) => (
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
                    {index !== 0 && <Divider margin="24px 0" height="0px" />}
                    <SubList>
                      <div className={`${styles.newsItemContent} ${item.isHot && !onlyHot ? styles.newsItemHot : ""}`}>
                        <div className={styles.titleContainer}>
                          <span className={`${styles.newsTitle} ${item.isHot ? styles.newsTitleHot : ""}`}>
                            {item.isHot && !onlyHot && <span className={styles.hotBadge}>{t("Common.HotNews")}</span>}
                            {item.title}
                          </span>
                          <p className={styles.newsTime}>{dayjs(item.created_at).format("H:mm")}</p>
                        </div>
                        <p className={styles.newsText}>{item.content}</p>
                        {item.edit_reason && (
                          <p className="edited-text">
                            {t("Common.Edited")}: {item.edit_reason}
                          </p>
                        )}
                      </div>
                    </SubList>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.noDataContainer}>
                  <SubList>
                    <p className={styles.noDataText}>{t("News.NoData")}</p>
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
