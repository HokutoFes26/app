"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Radio } from "antd";
import { CardBase, CardInside, Divider } from "@/components/Layout/CardComp";
import eventData from "@/../public/data/events.json";
import { useAppTime } from "@/components/contexts/TimeContext";
import dayjs from "dayjs";

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
  const oneHourLaterStr = currentTime.add(1, "hour").format("HH:mm");
  const currentDate = currentTime.date();
  const filteredEvents = useMemo(() => {
    const dateNum = currentTime.date();
    const dayKey = dateNum === 24 ? "day2" : "day1";
    const events: Event[] = (eventData as any)[dayKey] || [];

    return events.filter((e) => {
      if (filterMode === "all") return true;
      const isOngoing = nowTimeStr >= e.start && nowTimeStr <= e.end;
      const isUpcoming = e.start > nowTimeStr && e.start <= oneHourLaterStr;
      return isOngoing || isUpcoming;
    });
  }, [nowTimeStr, oneHourLaterStr, currentDate, filterMode]);

  return (
    <CardBase title={t("CardTitles.EVENTS")}>
      <CardInside>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Radio.Group value={filterMode} onChange={(e) => setFilterMode(e.target.value)} buttonStyle="solid">
            <Radio.Button value="hour">{t("Bus.FilterHour")}</Radio.Button>
            <Radio.Button value="all">{t("Bus.FilterAll")}</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ marginTop: "5%" }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const isOngoing = nowTimeStr >= event.start && nowTimeStr <= event.end;
              const isFinished = nowTimeStr > event.end;

              return (
                <React.Fragment key={index}>
                  {index !== 0 && (
                    <div style={{ padding: "8px 0" }}>
                      <Divider />
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      opacity: isFinished ? 0.4 : 1,
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{event.name}</p>
                      <p style={{ fontSize: "12px", margin: 0, opacity: 0.7 }}>
                        {event.start} - {event.end}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {isOngoing ? (
                        <span
                          style={{
                            fontSize: "11px",
                            background: "#ff4d4f",
                            color: "#fff",
                            padding: "6px 14px",
                            borderRadius: "9999px",
                            fontWeight: "bold",
                          }}
                        >
                          NOW
                        </span>
                      ) : isFinished ? (
                        <span style={{ fontSize: "11px", color: "#999" }}>{t("Event.Finished")}</span>
                      ) : (
                        <p style={{ fontSize: "11px", color: "var(--main-color)", margin: 0 }}>
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
                        </p>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            <div style={{ padding: "20px 0" }}>
              <p style={{ fontSize: "14px", color: "#999", textAlign: "center", width: "100%" }}>{t("Event.NoData")}</p>
            </div>
          )}
        </div>
      </CardInside>
    </CardBase>
  );
}
