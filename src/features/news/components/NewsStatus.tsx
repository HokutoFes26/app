"use client";

import React, { useState, useRef, useEffect } from "react";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsStatus } from "@/features/news/hooks/useNewsStatus";
import styles from "./NewsStatus.module.css";

export default function NewsStatus({ onlyHot = false, hotTime = 20 }: { onlyHot?: boolean; hotTime?: number }) {
  const { t } = useTranslation();
  const { isLoading, processedNews } = useNewsStatus(onlyHot, hotTime);
  const newsListRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleNewsScroll = () => {
    const el = newsListRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopShadow(scrollTop > 10);
    setShowBottomShadow(scrollHeight - scrollTop > clientHeight + 10);
  };

  useEffect(() => {
    if (!isLoading) {
      setTimeout(handleNewsScroll, 100);
    }
  }, [isLoading, processedNews]);

  if (onlyHot && processedNews.length === 0) return null;

  return (
    <CardBase
      title={onlyHot ? `${t("CardTitles.NEWS")} / ${t("Time.HotNews", { count: hotTime })}` : t("CardTitles.NEWS")}
    >
      <CardInside style={{ padding: 0 }}>
        {isLoading ? (
          <SubList>
            <p className={styles.loadingText}>Loading...</p>
          </SubList>
        ) : (
          <div className={styles.newsContainer}>
            <div className={styles.newsScrollWrapper}>
              <div
                className={`${styles.newsList} ${processedNews.length >= 4 ? styles.scrollable : ""}`}
                onScroll={handleNewsScroll}
                ref={newsListRef}
              >
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
                          <div
                            className={`${styles.newsItemContent} ${item.isHot && !onlyHot ? styles.newsItemHot : ""}`}
                          >
                            <div className={styles.titleContainer}>
                              <span className={`${styles.newsTitle} ${item.isHot ? styles.newsTitleHot : ""}`}>
                                {item.isHot && !onlyHot && (
                                  <span className={styles.hotBadge}>{t("Common.HotNews")}</span>
                                )}
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
              <div className={`${styles.newsShadow} ${styles.top} ${showTopShadow ? styles.visible : ""}`}></div>
              <div className={`${styles.newsShadow} ${styles.bottom} ${showBottomShadow ? styles.visible : ""}`}></div>
            </div>
          </div>
        )}
      </CardInside>
    </CardBase>
  );
}
