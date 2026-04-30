"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataContext, DataContextType } from "./DataContext";
import { supabase, api, StallStatus, NewsItem, LostItem, Question } from "@/lib/Server/api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePathname, useSearchParams } from "next/navigation";
import { useMapControl } from "@/contexts/MapContext";
import { loadJSON } from "@/lib/Data/JSONLoader";

dayjs.extend(customParseFormat);

const FETCH_INTERVAL_MS = 30000;
const FULL_REFRESH_FREQ = 3;

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mapControl = useMapControl();

  const isMapOpen = mapControl?.isMapOpen || false;
  const isBoothModalOpen = !!searchParams.get("booth-info");
  const isVotePage = pathname?.startsWith("/vote");
  const isAdminPage = pathname?.includes("/admin") || pathname?.includes("/booth");
  const isSuspended = (isAdminPage || isVotePage || isMapOpen || isBoothModalOpen);

  const [isLoading, setIsLoading] = useState(!isSuspended);
  const [stalls, setStalls] = useState<StallStatus[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<Record<string, number | null>>({});
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isStallsLive, setIsStallsLive] = useState(false);
  const isStallsLiveRef = useRef(false);

  const staticStallNameMap = useRef<Record<number | string, string>>({});

  useEffect(() => {
    loadJSON("booth").then((data: any[]) => {
      data.forEach((s) => {
        if (s.id) staticStallNameMap.current[s.id] = s.name;
      });
    });
  }, []);

  const isSuspendedRef = useRef(isSuspended);
  useEffect(() => {
    isSuspendedRef.current = isSuspended;
  }, [isSuspended]);

  const isInitialRefreshStarted = useRef(false);
  const refreshCycle = useRef(0);
  const lastFetchTime = useRef(0);
  const stallNameMap = useRef<Record<number | string, string>>({});

  const parseCompactDate = (compactDateStr: string) => {
    if (!compactDateStr) return new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const parsed = dayjs(`${currentYear}${compactDateStr}`, "YYYYMMDDHHmm");
    return parsed.toISOString();
  };

  const performRefresh = async (forceFull = false) => {
    if (isSuspendedRef.current && !forceFull) {
      console.log("[DataProvider] Refresh blocked (App is suspended or modal is open)");
      return;
    }
    const isFullRefresh = forceFull || refreshCycle.current % FULL_REFRESH_FREQ === 0;
    const currentTTL = FETCH_INTERVAL_MS - 1000;

    if (!isFullRefresh && isStallsLiveRef.current) {
      console.log("[DataProvider] Skipping stalls-only polling (Realtime is active)");
      refreshCycle.current = (refreshCycle.current + 1) % 24;
      return;
    }

    try {
      const allData = isFullRefresh
        ? await api.fetchAllData(forceFull ? 0 : currentTTL)
        : await api.fetchStallsOnly(currentTTL);

      if (allData) {
        lastFetchTime.current = Date.now();
        setLastUpdated(Date.now());

        if (allData.s) {
          setStalls(
            allData.s.map((row: any) => {
              const id = row.i;
              const name = staticStallNameMap.current[id] || row.n || stallNameMap.current[id] || `Stall ${id}`;
              if (row.n) stallNameMap.current[id] = row.n;

              return {
                id: id,
                stallName: name,
                crowdLevel: row.c,
                stockLevel: row.l,
              };
            }),
          );
        }
        if (isFullRefresh) {
          if (allData.n)
            setNews(
              allData.n.map((row: any) => ({
                id: row.i,
                title: row.t,
                content: row.c,
                created_at: parseCompactDate(row.a),
                edit_reason: row.r,
              })),
            );
          if (allData.l)
            setLostItems(
              allData.l.map((row: any) => ({
                id: row.i,
                name: row.n,
                place: row.p,
                created_at: parseCompactDate(row.a),
                edit_reason: row.r,
              })),
            );
          if (allData.q)
            setQuestions(
              allData.q.map((row: any) => ({
                id: row.i,
                text: row.t,
                answer: row.w,
                created_at: parseCompactDate(row.a),
                edit_reason: row.r,
              })),
            );
          if (allData.config) setConfig(allData.config);
        }
      }
    } catch (e: any) {
      console.error("[DataProvider] Refresh Error:", e?.message || e);
    } finally {
      setIsLoading(false);
      refreshCycle.current = (refreshCycle.current + 1) % 24;
    }
  };

  useEffect(() => {
    if (isSuspended) {
      setIsStallsLive(false);
      isStallsLiveRef.current = false;
      return;
    }

    const stallChannel = supabase
      .channel("stalls-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "stalls_status" }, (payload) => {
        const updatedRow = payload.new as any;
        setStalls((currentStalls) =>
          currentStalls.map((s) =>
            s.id === updatedRow.id
              ? { ...s, crowdLevel: updatedRow.crowd_level, stockLevel: updatedRow.stock_level }
              : s,
          ),
        );
      })
      .subscribe((status) => {
        const isLive = status === "SUBSCRIBED";
        setIsStallsLive(isLive);
        isStallsLiveRef.current = isLive;
      });

    const tables = ["news"];
    const otherChannels = tables.map((tableName) =>
      supabase
        .channel(`${tableName}-changes`)
        .on("postgres_changes", { event: "*", schema: "public", table: tableName }, () => {
          performRefresh(true);
        })
        .subscribe(),
    );

    return () => {
      supabase.removeChannel(stallChannel);
      otherChannels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [isSuspended]);

  useEffect(() => {
    if (isInitialRefreshStarted.current) return;
    if (isSuspended) return;
    isInitialRefreshStarted.current = true;
    performRefresh(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const diff = now - lastFetchTime.current;
        if (diff > FETCH_INTERVAL_MS) {
          if (!isSuspended) performRefresh(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSuspended]);

  useEffect(() => {
    if (isSuspended) return;

    const jitter = Math.floor(Math.random() * 5000);
    const timer = setInterval(() => performRefresh(), FETCH_INTERVAL_MS + jitter);
    return () => clearInterval(timer);
  }, [isSuspended]);

  const value: DataContextType = {
    api: {
      fetchedData: { stalls, news, lostItems, questions, config },
      isLoading,
      isPosting: false,
      error: "",
      fetchData: async () => performRefresh(true),
      handlePost: () => {},
      askQuestion: async (text: string) => {
        await api.qa.ask(text);
      },
      lastUpdated,
      isStallsLive,
    },
    work: {} as any,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
