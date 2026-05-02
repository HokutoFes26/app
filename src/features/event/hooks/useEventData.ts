import { useState, useMemo, useEffect } from "react";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useAppTime } from "@/contexts/TimeContext";
import dayjs from "dayjs";

export interface Event {
  name: string;
  start: string;
  end: string;
}

export const useEventData = () => {
  const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");
  const [eventData, setEventData] = useState<any>(null);
  const { currentTime } = useAppTime();

  useEffect(() => {
    loadJSON("events").then(setEventData);
  }, []);

  const currentDate = currentTime.date();
  const getEventTime = (timeStr: string) => {
    return dayjs(currentTime.format("YYYY-MM-DD") + " " + timeStr);
  };

  const filteredEvents = useMemo(() => {
    if (!eventData) return [];
    const dayKey = currentDate === 24 ? "day2" : "day1";
    const events: Event[] = (eventData as any)[dayKey] || [];
    const oneHourLater = currentTime.add(1, "hour");

    return events.filter((e) => {
      if (filterMode === "all") return true;
      const start = getEventTime(e.start);
      const end = getEventTime(e.end);
      const isOngoing = (currentTime.isAfter(start) || currentTime.isSame(start)) && currentTime.isBefore(end);
      const isUpcoming = start.isAfter(currentTime) && (start.isBefore(oneHourLater) || start.isSame(oneHourLater));
      return isOngoing || isUpcoming;
    });
  }, [currentTime, currentDate, filterMode, eventData]);

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

  return {
    filterMode,
    setFilterMode,
    filteredEvents,
    currentTime,
    getEventTime,
    newIndexMap,
  };
};
