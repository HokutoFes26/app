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
      <Radio.Group
        value={filterMode}
        onChange={(e) => setFilterMode(e.target.value)}
        buttonStyle="solid"
        size="small"
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Radio.Button
          value="hour"
          style={{
            background: filterMode === "hour" ? "var(--text-color)" : "var(--card-color)",
            color: filterMode === "hour" ? "var(--card-color)" : "var(--text-color)",
            border: "solid 0.5px var(--text-sub-color)",
            fontWeight: "bold",
            borderRadius: "999px 0 0 999px",
            fontSize: "12px",
            width: "80px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          In 1 hour
        </Radio.Button>
        <Radio.Button
          value="all"
          style={{
            background: filterMode === "hour" ? "var(--card-color)" : "var(--text-color)",
            color: filterMode === "hour" ? "var(--text-color)" : "var(--card-color)",
            border: "solid 0.5px var(--text-sub-color)",
            fontWeight: "bold",
            borderRadius: "0 999px 999px 0",
            fontSize: "12px",
            width: "80px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
                    key={index}
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
                    {index !== 0 && <Divider margin="20px 0" height="0px" />}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "var(--text-color)", margin: 0, fontSize: "18px", fontWeight: "600" }}>
                          {event.name}
                        </h4>
                      </div>
                      {isOngoing ? (
                        <span
                          style={{
                            background: "#ff4d4d",
                            color: "var(--bg-color)",
                            padding: "3px 16px 3px",
                            borderRadius: "9999px",
                            fontSize: "14px",
                            fontWeight: "900",
                            margin: "auto 0",
                            boxShadow: "0 0 8px #ff4d4d",
                          }}
                        >
                          NOW
                        </span>
                      ) : isUpcoming ? (
                        <span style={{ fontSize: "16px", fontWeight: "500", color: "#666", margin: "auto 0" }}>
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
                        <span style={{ fontSize: "16px", fontWeight: "500", color: "#666", margin: "auto 0" }}>
                          終了
                        </span>
                      )}
                    </div>

                    <MusicPlayerBar
                      start={event.start}
                      end={event.end}
                      now={nowTimeStr}
                      upcoming={isUpcoming}
                      isOngoing={isOngoing}
                    />
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
