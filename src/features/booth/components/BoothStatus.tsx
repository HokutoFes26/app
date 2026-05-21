"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { StatusLevel } from "@/features/booth/types";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import dayjs from "dayjs";
import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import { TrafficLight, BoothLegend, BoothTableHeader, commonStyles as cStyles } from "./BoothCommon";
import styles from "./BoothStatus.module.css";

export default function BoothStatus({ split }: { split?: "first" | "second" }) {
  const { t } = useTranslation();
  const {
    isLoading,
    mounted,
    statuses,
    lastUpdated,
    isStallsLive,
    favorites,
    toggleFavorite,
    handleStallClick,
    handleCrowdClick,
    handleStockClick,
    canEdit,
  } = useBoothStatus(split);

  const LiveStatus = (
    <div className={styles.liveStatus}>
      {isStallsLive ? (
        <span className={styles.liveText}>
          <span className={styles.liveDot} /> Live
        </span>
      ) : (
        <span className={styles.lastUpdatedText}>最終更新: {dayjs(lastUpdated).format("H:mm:ss")}</span>
      )}
    </div>
  );

  return (
    <CardBase
      title={`${t("CardTitles.BOOTH")}${split === "first" ? " (1/2)" : split === "second" ? " (2/2)" : ""}`}
      SubjectUpdated={LiveStatus}
      disableTapAnimation={true}
    >
      <CardInside>
        <BoothLegend />
        <BoothTableHeader />

        {isLoading || !mounted ? (
          <SubList>
            <p className={styles.loadingText}>Loading...</p>
          </SubList>
        ) : statuses.length > 0 ? (
          statuses.map((status, index) => (
            <React.Fragment key={`${status.stallName}-${index}`}>
              {index !== 0 && <Divider margin="8px 0" height="1px" />}
              <div className={cStyles.stallRow}>
                <div className={cStyles.stallInfo} onClick={() => handleStallClick(status.stallName)}>
                  <span className={cStyles.stallNameContainer}>
                    <span
                      onClick={(e) => toggleFavorite(e, status.stallName)}
                      className={styles.favoriteIcon}
                      style={{
                        color: favorites.includes(status.stallName) ? "#faad14" : "var(--text-sub-color)",
                        opacity: favorites.includes(status.stallName) ? 1 : 0.4,
                      }}
                    >
                      {favorites.includes(status.stallName) ? (
                        <StarRoundedIcon fontSize="inherit" />
                      ) : (
                        <StarOutlineRoundedIcon fontSize="inherit" />
                      )}
                    </span>
                    {status.stallName}
                  </span>
                  <span className={`${cStyles.stallDetails} ${cStyles.stallDetailsWithStar}`}>
                    {t("Booth.Details")}
                  </span>
                </div>
                <div className={cStyles.statusColumn}>
                  <TrafficLight
                    level={status.crowdLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleCrowdClick(status.stallName, status.crowdLevel)}
                  />
                </div>
                <div className={cStyles.statusColumn}>
                  <TrafficLight
                    level={status.stockLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleStockClick(status.stallName, status.stockLevel)}
                  />
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <SubList>
            <p className={styles.loadingText}>{t("Booth.NoData")}</p>
          </SubList>
        )}
      </CardInside>
    </CardBase>
  );
}
