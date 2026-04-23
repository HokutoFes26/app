"use client";

import React, { ReactNode, useState, useEffect, useMemo } from "react";
import { DataContext, DataContextType } from "@/contexts/DataContext";
import { RoleContext } from "@/contexts/RoleContext";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import stallsData from "@/../public/data/stalls.json";

const allStalls = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

export function DemoProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDemoBooth = pathname === "/demo/booth";
  const [nowStr, setNowStr] = useState(dayjs().toISOString());
  const [nowStrMinus10, setNowStrMinus10] = useState("2026-05-23T10:10:00");

  const [demoQuestions, setDemoQuestions] = useState([
    {
      id: "1",
      text: "体育館への行き方が難しい！",
      answer: "たしかに！",
      created_at: dayjs().subtract(1, "day").toISOString(),
      edit_reason: "",
    },
    {
      id: "2",
      text: "ゴミ箱の場所は？",
      answer: "たしかに！",
      created_at: dayjs().subtract(1, "day").toISOString(),
      edit_reason: "",
    },
  ]);

  useEffect(() => {
    setNowStr(dayjs().toISOString());
    setNowStrMinus10("2026-05-23T10:10:00");
  }, []);

  const randomStalls = useMemo(() => {
    return allStalls.map((stall) => {
      const getRand = () => {
        const r = Math.random();
        if (r < 0.5) return 0;
        if (r < 0.75) return 1;
        return 2;
      };
      return {
        stallName: stall.name,
        crowdLevel: getRand() as 0 | 1 | 2,
        stockLevel: getRand() as 0 | 1 | 2,
      };
    });
  }, []);

  const demoData: DataContextType = {
    api: {
      fetchedData: {
        stalls: randomStalls,
        news: [
          {
            id: "1",
            title: "エンディングの時刻を変更",
            content: "エンディングを+2日間延期します。",
            created_at: nowStrMinus10,
            edit_reason: "",
          },
        ],
        lostItems: [
          {
            id: "1",
            name: "黒い財布",
            place: "なごうら",
            created_at: dayjs("2026-05-23T11:14:00").toISOString(),
            edit_reason: "",
          },
        ],
        questions: demoQuestions,
      },
      isLoading: false,
      isPosting: false,
      error: "",
      fetchData: async () => {},
      handlePost: (mode: number) => {},
      askQuestion: async (text: string) => {
        setDemoQuestions((prev) => [
          {
            id: Date.now().toString(),
            text,
            answer: "",
            created_at: dayjs().toISOString(),
            edit_reason: "",
          },
          ...prev,
        ]);
      },
    },
    change: { serverConfig: { interval: 30000, freq: 2 } },
    work: {} as any,
  };

  const demoRole = {
    role: (isDemoBooth ? "stall-admin" : "user") as any,
    setRole: () => {},
    isAdmin: false,
    isStallAdmin: isDemoBooth,
    assignedStall: isDemoBooth ? "肉巻きおにぎり" : null,
  };

  return (
    <RoleContext.Provider value={demoRole}>
      <DataContext.Provider value={demoData}>{children}</DataContext.Provider>
    </RoleContext.Provider>
  );
}
