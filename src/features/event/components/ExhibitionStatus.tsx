"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import { commonStyles as cStyles } from "@/features/booth/components/BoothCommon";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";
import { useFavorites } from "@/features/booth/hooks/useFavorites";
import useAspectDetector from "@/hooks/useAspectDetector";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/features/vote/components/VoteStatus.module.css";

export default function ExhibitionStatus() {
  const { t } = useTranslation();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleStallClick } = useBoothStatus();
  const { favorites, toggleFavorite, mounted } = useFavorites();
  const isMobile = useAspectDetector();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(isMobile);
  }, [isMobile]);

  useEffect(() => {
    loadJSON("exhibitions").then((data) => {
      setExhibitions(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <CardBase title={t("CardTitles.EXHIBITIONS", "展示一覧")} disableTapAnimation={true}>
      <CardInside>
        <AnimatePresence initial={false} mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsExpanded(true)}
              className={styles.container}
            >
              <div className={styles.iconWrapper}>
                <VisibilityRoundedIcon className={styles.voteIcon} />
              </div>
              <div className={styles.contentWrapper}>
                <h4 className={styles.titleText}>展示一覧を見る</h4>
                <p className={styles.descText}>
                  {exhibitions.length > 0 ? `全 ${exhibitions.length} 件` : "Loading..."}
                </p>
              </div>
              <ExpandMoreIcon className={styles.arrowIcon} />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              {!isMobile && (
                <div
                  onClick={() => setIsExpanded(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: "10px",
                    color: "var(--text-sub-color)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  折りたたむ <ExpandLessIcon fontSize="small" />
                </div>
              )}
              {isLoading || !mounted ? (
                <SubList>
                  <p style={{ textAlign: "center", color: "#999", width: "100%" }}>Loading...</p>
                </SubList>
              ) : exhibitions.length > 0 ? (
                exhibitions.map((exhibition, index) => (
                  <motion.div
                    key={exhibition.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8, transition: { duration: 0.1 } }}
                    transition={{
                      layout: { type: "spring", stiffness: 500, damping: 40 },
                      opacity: { delay: index * 0.02, duration: 0.25 },
                      y: { delay: index * 0.02, duration: 0.25 },
                      scale: { delay: index * 0.02, duration: 0.25 },
                    }}
                  >
                    {index !== 0 && <Divider margin="8px 0" height="1px" />}
                    <div className={cStyles.stallRow} onClick={() => handleStallClick(exhibition.name)}>
                      <div className={cStyles.stallInfo}>
                        <span className={cStyles.stallNameContainer}>
                          {exhibition.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <span className={cStyles.stallDetails}>
                            {t("Booth.Details")}
                          </span>
                          <span style={{ fontSize: "0.8em", color: "var(--text-sub-color)" }}>{exhibition.team}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <SubList>
                  <p style={{ textAlign: "center", color: "#999", width: "100%" }}>{t("Booth.NoData")}</p>
                </SubList>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardInside>
    </CardBase>
  );
}
