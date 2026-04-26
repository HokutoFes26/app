"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Radio } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import eventData from "@/../public/data/events.json";
import { useAppTime } from "@/contexts/TimeContext";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import MusicPlayerBar from "@/components/Layout/MusicPlayerBar";

interface Event {
  name: string;
  start: string;
  end: string;
}

export default function EventStatus() {
  const { t } = useTranslation();
  const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");
  const { currentTime } = useAppTime();
  const nowTimeStr = currentTime.format("HH:mm");
  const currentDate = currentTime.date();
  const oneHourLaterStr = currentTime.add(1, "hour").format("HH:mm");

  const filteredEvents = useMemo(() => {
    const dayKey = currentDate === 24 ? "day2" : "day1";
    const events: Event[] = (eventData as any)[dayKey] || [];

    return events.filter((e) => {
      if (filterMode === "all") return true;
      const isOngoing = nowTimeStr >= e.start && nowTimeStr <= e.end;
      const isUpcoming = e.start > nowTimeStr && e.start <= oneHourLaterStr;
      return isOngoing || isUpcoming;
    });
  }, [nowTimeStr, oneHourLaterStr, currentDate, filterMode]);

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
            width: "60px",
          }}
        >
          In 1 hour
        </Radio.Button>
        <Radio.Button
          value="all"
          style={{
            background: filterMode === "hour" ? "#ffffff" : "#1d1d1d",
            color: filterMode === "hour" ? "#000000" : "#ffffff",
            border: "solid 0.5px var(--text-sub-color)",
            fontWeight: "bold",
            borderRadius: "0 999px 999px 0",
            fontSize: "12px",
            width: "60px",
          }}
        >
          All
        </Radio.Button>
      </Radio.Group>
    </div>
  );

  return (
    <CardBase title={t("CardTitles.EVENTS")} SubjectUpdated={FilterSwitcher}>
      <CardInside>
        <div style={{ position: "relative", gap: "15px" }}>
          <AnimatePresence initial={false} mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => {
                const isOngoing = nowTimeStr >= event.start && nowTimeStr <= event.end;
                const isFinished = nowTimeStr > event.end;
                const isUpcoming = !isOngoing && !isFinished;

                return (
                  <motion.div
                    key={event.name}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: isFinished ? 0.4 : 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "var(--text-color)", margin: 0, fontSize: "18px", fontWeight: "600" }}>
                          {event.name}
                        </h4>
                      </div>
                      {isOngoing ? (
                        <span
                          style={{
                            background: "#ff4d4f",
                            color: "var(--bg-color)",
                            padding: "5px 18px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "900",
                          }}
                        >
                          NOW
                        </span>
                      ) : isUpcoming ? (
                        <span style={{ fontSize: "16px", color: "#999", margin: "auto 0" }}>
                          {(() => {
                            const diffMin = dayjs(`2000-01-01 ${event.start}`).diff(
                              dayjs(`2000-01-01 ${nowTimeStr}`),
                              "minute",
                            );
                            if (diffMin >= 60) {
                              const hours = Math.floor(diffMin / 60);
                              return t("Time.HoursLater", { count: hours });
                            }
                            return t("Time.MinsLater", { count: diffMin });
                          })()}
                        </span>
                      ) : (
                        <span style={{ color: "#666", fontSize: "12px" }}>終了</span>
                      )}
                    </div>

                    <MusicPlayerBar
                      start={event.start}
                      end={event.end}
                      now={nowTimeStr}
                      upcoming={isUpcoming}
                      isOngoing={isOngoing}
                    />

                    {index !== filteredEvents.length - 1 && (
                      <div style={{ padding: "12px 0" }}>
                        <Divider />
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <p style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>No Events</p>
            )}
          </AnimatePresence>
        </div>
      </CardInside>
    </CardBase>
  );
}
