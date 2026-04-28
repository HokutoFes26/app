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
  const currentDate = currentTime.date();

  // イベントの時間を当日の日付と組み合わせたdayjsオブジェクトに変換するヘルパー
  const getEventTime = (timeStr: string) => {
    return dayjs(currentTime.format("YYYY-MM-DD") + " " + timeStr);
  };

  const filteredEvents = useMemo(() => {
    const dayKey = currentDate === 24 ? "day2" : "day1";
    const events: Event[] = (eventData as any)[dayKey] || [];
    const oneHourLater = currentTime.add(1, "hour");

    return events.filter((e) => {
      if (filterMode === "all") return true;
      const start = getEventTime(e.start);
      const end = getEventTime(e.end);

      // 10:10:00になった瞬間に isOngoing は false になる
      const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
      const isUpcoming = start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
      return isOngoing || isUpcoming;
    });
  }, [currentTime, currentDate, filterMode]);

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

  const isInHourRange = (e: Event) => {
    const start = getEventTime(e.start);
    const end = getEventTime(e.end);
    const oneHourLater = currentTime.add(1, "hour");
    const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
    const isUpcoming = start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
    return isOngoing || isUpcoming;
  };

  const newIndexMap = useMemo(() => {
    if (filterMode !== "all") return new Map<string, number>();
    const map = new Map<string, number>();
    let i = 0;
    for (const e of filteredEvents) {
      if (!isInHourRange(e)) {
        map.set(e.name, i++);
      }
    }

    return map;
  }, [filteredEvents, filterMode, currentTime]);

  return (
    <CardBase title={t("CardTitles.EVENTS")} SubjectUpdated={FilterSwitcher}>
      <CardInside>
        <div style={{ position: "relative", gap: "15px" }}>
          <AnimatePresence initial={false} mode="sync">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => {
                const start = getEventTime(event.start);
                const end = getEventTime(event.end);
                
                const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
                const isFinished = currentTime.isAfter(end) || currentTime.isSame(end);
                const isUpcoming = start.isAfter(currentTime);

                const newIndex = newIndexMap.get(event.name);
                const isNewItem = newIndex !== undefined;
                const enterDelay = isNewItem ? 0.1 + newIndex * 0.06: 0;

                return (
                  <motion.div
                    key={event.name}
                    layout
                    initial={isNewItem ? { opacity: 0, y: 30, scale: 0.8 } : false}
                    animate={{ opacity: isFinished ? 0.4 : 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: -30,
                      scale: 0.8,
                      transition: { duration: 0.1 },
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 500,
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            color: "var(--text-color)",
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: "600",
                          }}
                        >
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
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "var(--text-sub-color)",
                            margin: "auto 0",
                          }}
                        >
                          {(() => {
                            const diffMin = start.diff(currentTime, "minute");
                            if (diffMin >= 60) {
                              const hours = Math.floor(diffMin / 60);
                              return t("Time.HoursLater", { count: hours });
                            }
                            return t("Time.MinsLater", { count: diffMin });
                          })()}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "var(--text-sub-color)",
                            margin: "auto 0",
                          }}
                        >
                          終了
                        </span>
                      )}
                    </div>

                    <MusicPlayerBar
                      start={event.start}
                      end={event.end}
                      now={currentTime.format("H:mm")}
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
