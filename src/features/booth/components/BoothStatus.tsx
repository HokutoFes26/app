"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, SubList, Divider } from "@/components/Layout/CardComp";
import { StatusLevel } from "@/features/booth/types";;
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import dayjs from "dayjs";
import { useBoothStatus } from "@/features/booth/hooks/useBoothStatus";
import styles from "./BoothStatus.module.css";

const TrafficLight = ({
  level,
  onClick,
  disabled,
}: {
  level: StatusLevel;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const colorMap: Record<StatusLevel, string> = {
    0: "#52c41a",
    1: "#faad14",
    2: "#ff4d4f",
  };
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`${styles.trafficLight} ${disabled ? styles.trafficLightDisabled : styles.trafficLightClickable}`}
      style={{
        backgroundColor: colorMap[level],
        opacity: disabled ? 1 : 0.8,
        transform: disabled ? "none" : "scale(1.1)",
      }}
    />
  );
};

const LegendItem = ({ level, crowd, stock }: { level: StatusLevel; crowd: string; stock: string }) => (
  <div className={styles.legendItem}>
    <TrafficLight level={level} disabled />
    <div className={styles.legendText}>
      <span className={styles.legendSmall}>{crowd}</span>
      <span className={styles.legendSmall}>{stock}</span>
    </div>
  </div>
);

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
        <span className={styles.lastUpdatedText}>
          最終更新: {dayjs(lastUpdated).format("H:mm:ss")}
        </span>
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
        <div className={styles.legendContainer}>
          <LegendItem level={0} crowd={t("Booth.Crowd.Green")} stock={t("Booth.Stock.Green")} />
          <LegendItem level={1} crowd={t("Booth.Crowd.Yellow")} stock={t("Booth.Stock.Yellow")} />
          <LegendItem level={2} crowd={t("Booth.Crowd.Red")} stock={t("Booth.Stock.Red")} />
        </div>

        <div className={styles.tableHeader}>
          <div className={styles.headerName}>{t("Booth.Name")}</div>
          <div className={styles.headerColumn}>{t("Booth.CrowdLabel")}</div>
          <div className={styles.headerColumn}>{t("Booth.StockLabel")}</div>
        </div>

        {isLoading || !mounted ? (
          <SubList>
            <p className={styles.loadingText}>Loading...</p>
          </SubList>
        ) : statuses.length > 0 ? (
          statuses.map((status, index) => (
            <React.Fragment key={`${status.stallName}-${index}`}>
              {index !== 0 && <Divider margin="8px 0" height="1px" />}
              <div className={styles.stallRow}>
                <div
                  className={styles.stallInfo}
                  onClick={() => handleStallClick(status.stallName)}
                >
                  <span className={styles.stallNameContainer}>
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
                  <span className={styles.stallDetails}>{t("Booth.Details")}</span>
                </div>
                <div className={styles.statusColumn}>
                  <TrafficLight
                    level={status.crowdLevel}
                    disabled={!canEdit(status.stallName)}
                    onClick={() => handleCrowdClick(status.stallName, status.crowdLevel)}
                  />
                </div>
                <div className={styles.statusColumn}>
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
