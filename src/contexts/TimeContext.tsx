"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import dayjs, { Dayjs } from "dayjs";

interface TimeContextType {
  currentTime: Dayjs;
  setCurrentTime: (time: Dayjs) => void;
  isMocked: boolean;
  resetTime: () => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: ReactNode }) {
  const getInitialOffset = () => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("app_time_offset");
      if (stored) return parseInt(stored, 10);
    }
    if (process.env.NEXT_PUBLIC_MOCK_TIME) {
      return dayjs(process.env.NEXT_PUBLIC_MOCK_TIME).diff(dayjs());
    }
    return 0;
  };

  const [timeOffset, setTimeOffset] = useState<number>(getInitialOffset);
  const [isMocked, setIsMocked] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("app_time_offset") !== null;
    }
    return !!process.env.NEXT_PUBLIC_MOCK_TIME;
  });
  const [realTime, setRealTime] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setCurrentTime = useCallback((targetTime: Dayjs) => {
    const offset = targetTime.diff(dayjs());
    setTimeOffset(offset);
    setIsMocked(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("app_time_offset", offset.toString());
    }
  }, []);

  const resetTime = useCallback(() => {
    setTimeOffset(0);
    setIsMocked(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("app_time_offset");
    }
    setRealTime(dayjs());
  }, []);

  const currentTime = useMemo(() => {
    return realTime.add(timeOffset, "ms");
  }, [realTime, timeOffset]);

  const value = useMemo(
    () => ({
      currentTime,
      setCurrentTime,
      isMocked,
      resetTime,
    }),
    [currentTime, setCurrentTime, isMocked, resetTime],
  );

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export function useAppTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error("useAppTime must be used within a TimeProvider");
  }
  return context;
}
