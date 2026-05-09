"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList } from "@/components/Layout/CardComp";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import { AnimatePresence } from "framer-motion";
import { useVisited } from "../hooks/useVisited";
import VisitedCollection from "./VisitedCollection";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";
import { BoothItem } from "./BoothDetailModal";
import styles from "@/features/vote/components/VoteStatus.module.css";

export default function VisitedCard() {
  const { t } = useTranslation();
  const { visited, mounted } = useVisited();
  const [isOpen, setIsOpen] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [booths, setBooths] = useState<BoothItem[]>([]);

  useEffect(() => {
    loadJSON("exhibitions").then(setExhibitions);
    loadJSON("booth").then(setBooths);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ cursor: "pointer", width: "100%" }}>
        <CardBase title={t("Booth.MyTickets", "思い出コレクション")}>
          <CardInside>
            <SubList>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                  <AirplaneTicketIcon className={styles.voteIcon} />
                </div>
                <div className={styles.contentWrapper}>
                  <h4 className={styles.titleText}>{t("Booth.CollectedTickets", "集めたチケット")}</h4>
                  <p className={styles.descText}>
                    {visited.length} {t("Booth.TicketsCount", "枚")}
                  </p>
                </div>
              </div>
              <CallMadeRoundedIcon className={styles.arrowIcon} />
            </SubList>
          </CardInside>
        </CardBase>
      </div>

      <AnimatePresence>
        {isOpen && (
          <VisitedCollection
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            exhibitions={exhibitions}
            booths={booths}
          />
        )}
      </AnimatePresence>
    </>
  );
}
