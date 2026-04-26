"use client";

import React, { useState, useMemo } from "react";
import { Select, Tag, Radio } from "antd";
import { useTranslation } from "react-i18next";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import busData from "@/../public/data/bus.json";
import { useAppTime } from "@/contexts/TimeContext";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const allStops = Array.from(new Set([...busData.HongoToImizu.route, ...busData.ImizuToHongo.route]));

interface BusTrip {
  time: string;
  arrivalTime: string;
  isoTime: string;
  routeTitle: string;
  direction: "to-imizu" | "to-hongo";
}

export default function BusStatus() {
  const { t } = useTranslation();
  const { currentTime } = useAppTime();
  const nowTimeStr = currentTime.format("HH:mm");
  const oneHourLaterStr = currentTime.add(1, "hour").format("HH:mm");
  const isAfternoon = nowTimeStr >= "12:00";
  const [fromStop, setFromStop] = useState(isAfternoon ? "射水キャンパス 発" : "富山駅北口 発");
  const [toStop, setToStop] = useState(isAfternoon ? "富山駅北口 着" : "射水キャンパス 着");
  const [lastAutoPeriod, setLastAutoPeriod] = useState(isAfternoon ? "PM" : "AM");
  const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");

  React.useEffect(() => {
    const currentPeriod = nowTimeStr >= "12:00" ? "PM" : "AM";
    if (currentPeriod !== lastAutoPeriod) {
      if (currentPeriod === "PM") {
        setFromStop("射水キャンパス 発");
        setToStop("富山駅北口 着");
      } else {
        setFromStop("富山駅北口 発");
        setToStop("射水キャンパス 着");
      }
      setLastAutoPeriod(currentPeriod);
    }
  }, [nowTimeStr, lastAutoPeriod]);

  const normalizeTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const filteredBuses = useMemo(() => {
    const results: BusTrip[] = [];
    const processRoute = (routeData: any, direction: "to-imizu" | "to-hongo") => {
      const fromIdx = routeData.route.indexOf(fromStop);
      const toIdx = routeData.route.indexOf(toStop);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        routeData.time[fromIdx].forEach((time: string, tripIndex: number) => {
          const arrivalTime = routeData.time[toIdx][tripIndex];

          if (time && arrivalTime) {
            const isoTime = normalizeTime(time);
            const isUpcoming = isoTime > nowTimeStr;
            const isWithinHour = isUpcoming && isoTime <= oneHourLaterStr;

            if (filterMode === "all" || isWithinHour) {
              let label = direction === "to-imizu" ? t("Bus.ToImizu") : t("Bus.ToToyamaHongo");
              if (toStop === "富山駅北口 着") {
                label = t("Bus.ToToyamaStation");
              }

              results.push({
                time,
                arrivalTime,
                isoTime,
                routeTitle: label,
                direction,
              });
            }
          }
        });
      }
    };

    processRoute(busData.HongoToImizu, "to-imizu");
    processRoute(busData.ImizuToHongo, "to-hongo");

    return results.sort((a, b) => a.isoTime.localeCompare(b.isoTime));
  }, [fromStop, toStop, nowTimeStr, oneHourLaterStr, filterMode, t]);

  const FilterSwitcher = (
    <div style={{ marginRight: "16px" }}>
      <Radio.Group value={filterMode} onChange={(e) => setFilterMode(e.target.value)} buttonStyle="solid" size="small">
        <Radio.Button
          value="hour"
          style={{
            background: filterMode === "hour" ? "#1d1d1d" : "#ffffff",
            color: filterMode === "hour" ? "#ffffff" : "#000000",
            border: "solid 0.5px var(--text-sub-color)",
            fontWeight: "bold",
            borderRadius: "999px 0 0 999px",
            fontSize: "12px",
            width: "80px",
          }}
        >
          In 1 hour
        </Radio.Button>
        <Radio.Button
          value="all"
          style={{
            background: filterMode === "hour" ? "var(--card-color)" : "#1d1d1d",
            color: filterMode === "hour" ? "#000000" : "#ffffff",
            border: "solid 0.5px var(--text-sub-color)",
            fontWeight: "bold",
            borderRadius: "0 999px 999px 0",
            fontSize: "12px",
            width: "80px",
          }}
        >
          All
        </Radio.Button>
      </Radio.Group>
    </div>
  );

  const stopOptions = allStops
    .filter((s) => s.includes("発") || s.includes("着"))
    .map((s) => ({
      value: s,
      label: t(`Bus.Stops.${s}`, s),
    }));

  return (
    <CardBase title={t("CardTitles.BUS")} SubjectUpdated={FilterSwitcher}>
      <CardInside>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2em", width: "40px" }}>{t("Bus.From")}</span>
            <Select
              value={fromStop}
              options={stopOptions.filter((o) => o.value.includes("発"))}
              onChange={setFromStop}
              style={{ flex: 1 }}
              size="large"
              placement="bottomLeft"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2em", width: "40px" }}>{t("Bus.To")}</span>
            <Select
              value={toStop}
              options={stopOptions.filter((o) => o.value.includes("着"))}
              onChange={setToStop}
              style={{ flex: 1 }}
              size="large"
              placement="bottomLeft"
            />
          </div>
        </div>

        <div style={{ position: "relative", gap: "15px" }}>
          <AnimatePresence initial={false} mode="popLayout">
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus, index) => {
                const isPast = bus.isoTime <= nowTimeStr;
                return (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: isPast ? 0.4 : 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {index !== 0 && <Divider margin="20px 0" height="0px" />}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 0",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <Tag
                          color={bus.direction === "to-imizu" ? "blue" : "orange"}
                          style={{ fontSize: "10px", marginBottom: "4px" }}
                        >
                          {bus.routeTitle}
                        </Tag>
                        <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0, color: "var(--text-color)" }}>
                          {bus.time}
                          <span style={{ fontSize: "12px", fontWeight: "normal", color: "#666", marginLeft: "4px" }}>
                            {t("Bus.Departure")}
                          </span>
                          <span style={{ fontSize: "12px", color: "#888", fontWeight: "normal" }}> →</span>{" "}
                          {bus.arrivalTime}
                          <span style={{ fontSize: "12px", fontWeight: "normal", color: "#666", marginLeft: "4px" }}>
                            {t("Bus.Arrival")}
                          </span>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {!isPast ? (
                          <p style={{ fontSize: "11px", color: "var(--main-color)", margin: 0 }}>
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
                          <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>{t("Bus.Departed")}</p>
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
                style={{ fontSize: "13px", color: "#999", padding: "10px 0", textAlign: "center" }}
              >
                {t("Bus.NoBuses")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </CardInside>
    </CardBase>
  );
}
