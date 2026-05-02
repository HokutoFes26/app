import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useAppTime } from "@/contexts/TimeContext";
import dayjs from "dayjs";

export interface BusTrip {
  time: string;
  arrivalTime: string;
  isoTime: string;
  routeTitle: string;
  direction: "to-imizu" | "to-hongo";
}

export const useBusData = () => {
  const { t } = useTranslation();
  const [busData, setBusData] = useState<any>(null);
  const { currentTime } = useAppTime();

  useEffect(() => {
    loadJSON("bus").then(setBusData);
  }, []);

  const allStops = useMemo(() => {
    if (!busData || !busData.HongoToImizu || !busData.ImizuToHongo) return [];
    return Array.from(new Set([...busData.HongoToImizu.route, ...busData.ImizuToHongo.route]));
  }, [busData]);

  const nowTimeStr = currentTime.format("HH:mm");
  const oneHourLaterStr = currentTime.add(1, "hour").format("HH:mm");
  const isAfternoon = currentTime.hour() >= 12;
  const [fromStop, setFromStop] = useState(isAfternoon ? "射水キャンパス 発" : "富山駅北口 発");
  const [toStop, setToStop] = useState(isAfternoon ? "富山駅北口 着" : "射水キャンパス 着");
  const [lastAutoPeriod, setLastAutoPeriod] = useState(isAfternoon ? "PM" : "AM");
  const [filterMode, setFilterMode] = useState<"hour" | "all">("hour");

  useEffect(() => {
    const currentPeriod = currentTime.hour() >= 12 ? "PM" : "AM";
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
  }, [nowTimeStr, lastAutoPeriod, currentTime]);

  const normalizeTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const filteredBuses = useMemo(() => {
    if (!busData) return [];
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
  }, [busData, fromStop, toStop, nowTimeStr, oneHourLaterStr, filterMode, t]);

  const stopOptions = allStops
    .filter((s) => s.includes("発") || s.includes("着"))
    .map((s) => ({
      value: s,
      label: t(`Bus.Stops.${s}`, s),
    }));

  const isInHourRange = (bus: BusTrip) => {
    const isUpcoming = bus.isoTime > nowTimeStr;
    return isUpcoming && bus.isoTime <= oneHourLaterStr;
  };

  const newIndexMap = useMemo(() => {
    if (filterMode !== "all") return new Map<string, number>();
    const map = new Map<string, number>();
    let i = 0;
    for (const bus of filteredBuses) {
      if (!isInHourRange(bus)) {
        map.set(bus.isoTime, i++);
      }
    }

    return map;
  }, [filteredBuses, filterMode, nowTimeStr, oneHourLaterStr]);

  return {
    busData,
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
    isInHourRange,
  };
};
