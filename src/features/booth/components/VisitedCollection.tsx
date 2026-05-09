"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import SearchIcon from "@mui/icons-material/Search";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useVisited } from "../hooks/useVisited";
import { useTranslation } from "react-i18next";
import { useData } from "@/contexts/DataContext";
import styles from "./VisitedCollection.module.css";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";
import { BoothItem } from "./BoothDetailModal";
import dayjs from "dayjs";

interface VisitedCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  exhibitions: Exhibition[];
  booths: BoothItem[];
}

export default function VisitedCollection({ isOpen, onClose, exhibitions, booths }: VisitedCollectionProps) {
  const { t } = useTranslation();
  const { visited } = useVisited();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const visitedItems = visited.map((record) => {
    const name = record.name;
    const stall = booths.find((s) => s.name === name);
    const exhibition = exhibitions.find((e) => e.name === name);
    return {
      name,
      team: stall?.team || exhibition?.team || "",
      place: stall?.place || exhibition?.place || "不明",
      type: stall ? "Booth" : "Exhibition",
      img: stall?.image || exhibition?.image || "",
      visitedAt: record.visitedAt,
    };
  });

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.walletContainer}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={styles.header} onClick={onClose} style={{ cursor: "pointer" }}>
          <h2>{t("Booth.MyTickets")}</h2>
          <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.ticketsWrapper} onClick={onClose}>
          {visitedItems.length === 0 ? (
            <div className={styles.emptyState} onClick={(e) => e.stopPropagation()}>
              <h3>{t("Booth.GuideTitle")}</h3>
              <p className={styles.emptySub}>{t("Booth.NoTicketsSub")}</p>
              <div className={styles.guideList}>
                <div className={styles.guideStep}>
                  <SearchIcon />
                  <span>{t("Booth.GuideStep1")}</span>
                </div>
                <div className={styles.guideStep}>
                  <TouchAppIcon />
                  <span>{t("Booth.GuideStep2")}</span>
                </div>
                <div className={styles.guideStep}>
                  <AddCircleIcon />
                  <span>{t("Booth.GuideStep3")}</span>
                </div>
              </div>

              <button className={styles.guideButton} onClick={onClose}>
                {t("Booth.GuideClose")}
              </button>
            </div>
          ) : (
            visitedItems.map((item, index) => {
              const isSelected = selectedTicket === item.name;
              const topOffset = isSelected ? 0 : index * 75;
              const zIndex = isSelected ? 100 : index;

              return (
                <motion.div
                  key={item.name}
                  className={`${styles.ticketContainer} ${isSelected ? styles.selected : ""}`}
                  layout
                  initial={{ y: 500, opacity: 0 }}
                  animate={{
                    y: selectedTicket && !isSelected ? 800 : topOffset,
                    opacity: selectedTicket && !isSelected ? 0 : 1,
                  }}
                  exit={{ y: 800, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ zIndex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTicket(isSelected ? null : item.name);
                  }}
                >
                  <div className={styles.ticket}>
                    <div className={styles.ticketTop}>
                      <p className={styles.ticketName}>{item.name}</p>
                      <div className={styles.ticketHeaderRight}>
                        <span className={styles.ticketType}>{item.type === "Booth" ? "BOOTH" : "EXHIBITION"}</span>
                        <span className={styles.ticketDate}>{dayjs(item.visitedAt).format("M/D H:mm")}</span>
                      </div>
                    </div>
                    {item.img && <img src={item.img} className={styles.ticketImage} alt={item.name} />}
                    <div className={styles.ticketBottom}>
                      <div className={styles.ticketInfo}>
                        <span className={styles.infoLabel}>TEAM</span>
                        <span className={styles.infoValue}>{item.team}</span>
                      </div>
                      <div className={styles.ticketInfo}>
                        <span className={styles.infoLabel}>PLACE</span>
                        <span className={styles.infoValue}>{item.place}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
