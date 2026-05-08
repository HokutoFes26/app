"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { StatusLevel } from "@/features/booth/types";
import styles from "./BoothCommon.module.css";

export const commonStyles = styles;

export const TrafficLight = ({
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

export const LegendItem = ({ level, crowd, stock }: { level: StatusLevel; crowd: string; stock: string }) => (
  <div className={styles.legendItem}>
    <TrafficLight level={level} disabled />
    <div className={styles.legendText}>
      <span className={styles.legendSmall}>{crowd}</span>
      <span className={styles.legendSmall}>{stock}</span>
    </div>
  </div>
);

export const BoothLegend = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.legendContainer}>
      <LegendItem level={0} crowd={t("Booth.Crowd.Green")} stock={t("Booth.Stock.Green")} />
      <LegendItem level={1} crowd={t("Booth.Crowd.Yellow")} stock={t("Booth.Stock.Yellow")} />
      <LegendItem level={2} crowd={t("Booth.Crowd.Red")} stock={t("Booth.Stock.Red")} />
    </div>
  );
};

export const BoothTableHeader = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.tableHeader}>
      <div className={styles.headerName}>{t("Booth.Name")}</div>
      <div className={styles.headerColumn}>{t("Booth.CrowdLabel")}</div>
      <div className={styles.headerColumn}>{t("Booth.StockLabel")}</div>
    </div>
  );
};
