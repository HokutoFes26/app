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
  const getInitialMockTime = () => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("app_mock_time");
      if (stored) return dayjs(stored);
    }
    return process.env.NEXT_PUBLIC_MOCK_TIME ? dayjs(process.env.NEXT_PUBLIC_MOCK_TIME) : null;
  };

  const [mockTime, setMockTime] = useState<Dayjs | null>(getInitialMockTime);
  const [realTime, setRealTime] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setCurrentTime = useCallback((time: Dayjs) => {
    setMockTime(time);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("app_mock_time", time.toISOString());
    }
  }, []);

  const resetTime = useCallback(() => {
    setMockTime(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("app_mock_time");
    }
    setRealTime(dayjs());
  }, []);

  const value = useMemo(
    () => ({
      currentTime: mockTime || realTime,
      setCurrentTime,
      isMocked: mockTime !== null,
      resetTime,
    }),
    [mockTime, realTime, setCurrentTime, resetTime],
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
