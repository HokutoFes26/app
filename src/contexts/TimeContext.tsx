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
  const [mockTime, setMockTime] = useState<Dayjs | null>(null);
  const [realTime, setRealTime] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(dayjs());
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const setCurrentTime = useCallback((time: Dayjs) => {
    setMockTime(time);
  }, []);

  const resetTime = useCallback(() => {
    setMockTime(null);
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
