"use client";

import React, { useMemo } from "react";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { useAppTime } from "@/contexts/TimeContext";
import { useTranslation } from "react-i18next";
import { useData } from "@/contexts/DataContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsStatus({ onlyHot = false, hotTime = 10 }: { onlyHot?: boolean; hotTime?: number }) {
  const { t } = useTranslation();
  const {
    api: { fetchedData, isLoading },
  } = useData();
  const { currentTime } = useAppTime();
  const news = fetchedData?.news || [];
  const processedNews = useMemo(() => {
    const nowMs = currentTime.valueOf();
    const newsWithHot = news.map((item) => {
      const diff = (nowMs - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return { ...item, isHot: diff >= -1 && diff <= hotTime };
    });

    const filtered = onlyHot ? newsWithHot.filter((n) => n.isHot) : newsWithHot;

    return filtered.sort((a, b) => {
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      return dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf();
    });
  }, [news, currentTime, onlyHot]);

  if (onlyHot && processedNews.length === 0) return null;

  return (
    <CardBase
      title={
        onlyHot ? `${t("CardTitles.NEWS")} / ${t("Time.HotNews", { count: hotTime })}` : t("CardTitles.NEWS")
      }
    >
      <CardInside>
        {isLoading ? (
          <SubList>
            <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>
              Loading...
            </p>
          </SubList>
        ) : (
          <div style={{ position: "relative" }}>
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
                        style={{
                          textAlign: "left",
                          width: "100%",
                          borderLeft: item.isHot && !onlyHot ? "4px solid #ff4d4f" : "none",
                          paddingLeft: item.isHot && !onlyHot ? "10px" : "0",
                          transition: "all 0.3s",
                        }}
                      >
                        <div className="subProp">
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: item.isHot ? "#ff4d4f" : "var(--main-color)",
                            }}
                          >
                            {item.isHot && !onlyHot && (
                              <span style={{ marginRight: "8px", color: "#ff4d4f" }}>
                                {t("Common.HotNews")}
                              </span>
                            )}
                            {item.title}
                          </span>
                          <p
                            style={{
                              fontSize: "16px",
                              color: "var(--text-sub-color)",
                              margin: 0,
                              textAlign: "right",
                            }}
                          >
                            {dayjs(item.created_at).format("H:mm")}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--text-sub-color)",
                            margin: "0 0 8px 0",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.content}
                        </p>
                        {item.edit_reason && (
                          <p className="edited-text">編集済み: {item.edit_reason}</p>
                        )}
                      </div>
                    </SubList>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ padding: "20px 0" }}
                >
                  <SubList>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-sub-color)",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      {t("News.NoData")}
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
