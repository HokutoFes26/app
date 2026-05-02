"use client";

import React from "react";
import { Select, Tag, Radio } from "antd";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import NoTransferRoundedIcon from "@mui/icons-material/NoTransferRounded";
import { useBusData, BusTrip } from "../hooks/useBusData";
import styles from "./BusStatus.module.css";

export default function BusStatus() {
  const { t } = useTranslation();
  const {
    fromStop,
    setFromStop,
    toStop,
    setToStop,
    filterMode,
    setFilterMode,
    filteredBuses,
    stopOptions,
    nowTimeStr,
    newIndexMap,
  } = useBusData();

  const FilterSwitcher = (
    <div className={styles.switcher}>
      <Radio.Group value={filterMode} onChange={(e) => setFilterMode(e.target.value)} buttonStyle="solid" size="small">
        <Radio.Button
          value="hour"
          className={`${styles.radioBtn} ${styles.radioBtnHour}`}
          style={{
            background: filterMode === "hour" ? "var(--text-color)" : "var(--card-color)",
            color: filterMode === "hour" ? "var(--card-color)" : "var(--text-color)",
            borderRadius: "999px 0 0 999px",
          }}
        >
          {t("Bus.FilterHour")}
        </Radio.Button>
        <Radio.Button
          value="all"
          className={`${styles.radioBtn} ${styles.radioBtnAll}`}
          style={{
            background: filterMode === "hour" ? "var(--card-color)" : "var(--text-color)",
            color: filterMode === "hour" ? "var(--text-color)" : "var(--card-color)",
            borderRadius: "0 999px 999px 0",
          }}
        >
          {t("Bus.FilterAll")}
        </Radio.Button>
      </Radio.Group>
    </div>
  );

  return (
    <CardBase title={t("CardTitles.BUS")} SubjectUpdated={FilterSwitcher}>
      <CardInside>
        <div className={styles.selectContainer}>
          <div className={styles.selectRow}>
            <span className={styles.selectLabel}>{t("Bus.From")}</span>
            <Select
            value={fromStop}
            options={stopOptions.filter((o) => o.value.includes("発"))}
            onChange={setFromStop}
            className={styles.selectField}
            size="large"
            placement="bottomLeft"
            style={{ textAlign: "center" }}
            styles={{ popup: { root: { textAlign: "center" } } }}
            />
            </div>
            <div className={styles.selectRow}>
            <span className={styles.selectLabel}>{t("Bus.To")}</span>
            <Select
            value={toStop}
            options={stopOptions.filter((o) => o.value.includes("着"))}
            onChange={setToStop}
            className={styles.selectField}
            size="large"
            placement="bottomLeft"
            style={{ textAlign: "center" }}
            styles={{ popup: { root: { textAlign: "center" } } }}
            />          </div>
        </div>

        <div className={styles.listContainer}>
          <AnimatePresence initial={false} mode="sync">
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus, index) => {
                const isPast = bus.isoTime <= nowTimeStr;
                const newIndex = newIndexMap.get(bus.isoTime);
                const isNewItem = newIndex !== undefined;
                const enterDelay = isNewItem ? 0.1 + newIndex * 0.06 : 0;
                return (
                  <motion.div
                    key={bus.isoTime}
                    layout
                    initial={isNewItem ? { opacity: 0, y: 30, scale: 0.8 } : false}
                    animate={{ opacity: isPast ? 0.4 : 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.9,
                      transition: { duration: 0.08 },
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 40,
                      },
                      opacity: {
                        delay: enterDelay,
                        duration: isNewItem ? 0.25 : 0.08,
                      },
                      y: {
                        delay: enterDelay,
                        duration: isNewItem ? 0.25 : 0.08,
                      },
                      scale: {
                        delay: enterDelay,
                        duration: isNewItem ? 0.25 : 0.08,
                      },
                    }}
                  >
                    {index !== 0 && <Divider margin="20px 0" height="0px" />}
                    <div className={styles.busItem}>
                      <div style={{ textAlign: "left" }}>
                        <Tag color={bus.direction === "to-imizu" ? "blue" : "orange"} className={styles.routeTag}>
                          {bus.routeTitle}
                        </Tag>
                        <p className={styles.timeText}>
                          {bus.time}
                          <span className={styles.timeLabel}>{t("Bus.Departure")}</span>
                          <span className={styles.arrowLabel}> →</span> {bus.arrivalTime}
                          <span className={styles.timeLabel}>{t("Bus.Arrival")}</span>
                        </p>
                      </div>
                      <div className={styles.diffText}>
                        {!isPast ? (
                          <p className={styles.diffValue}>
                            {(() => {
                              const diffMin = dayjs(`2000-01-01 ${bus.isoTime}`).diff(
                                dayjs(`2000-01-01 ${nowTimeStr}`),
                                "minute",
                              );
                              if (diffMin >= 60) {
                                const hours = Math.floor(diffMin / 60);
                                return t("Time.HoursLater", { count: hours });
                              }
                              return t("Time.MinsLater", { count: diffMin });
                            })()}
                          </p>
                        ) : (
                          <p className={styles.departedValue}>{t("Bus.Departed")}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.p
                key="no-buses"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.noBuses}
              >
                <NoTransferRoundedIcon className={styles.noBusesIcon} />
                {t("Bus.NoBuses")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </CardInside>
    </CardBase>
  );
}
