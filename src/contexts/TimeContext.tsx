"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import dayjs, { Dayjs } from "dayjs";

interface TimeContextType {
  currentTime: Dayjs;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: ReactNode }) {
  const getInitialOffset = () => {
    if (process.env.NEXT_PUBLIC_MOCK_TIME) {
      return dayjs(process.env.NEXT_PUBLIC_MOCK_TIME).diff(dayjs());
    }
    return 0;
  };

  const [timeOffset] = useState<number>(getInitialOffset);
  const [realTime, setRealTime] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = useMemo(() => {
    return realTime.add(timeOffset, "ms");
  }, [realTime, timeOffset]);

  const value = useMemo(
    () => ({
      currentTime,
    }),
    [currentTime],
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
