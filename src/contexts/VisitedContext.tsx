"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface VisitedRecord {
  name: string;
  visitedAt: number;
}

interface VisitedContextType {
  visited: VisitedRecord[];
  toggleVisited: (stallName: string) => void;
  isVisited: (stallName: string) => boolean;
  mounted: boolean;
}

const VisitedContext = createContext<VisitedContextType | undefined>(undefined);

const VISITED_STORAGE_KEY = "hp-visited-booths-v2";

export const VisitedProvider = ({ children }: { children: ReactNode }) => {
  const [visited, setVisited] = useState<VisitedRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(VISITED_STORAGE_KEY);
    if (stored) {
      try {
        setVisited(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse visited booths", e);
      }
    } else {
      const oldStored = localStorage.getItem("hp-visited-booths");
      if (oldStored) {
        try {
          const oldData: string[] = JSON.parse(oldStored);
          const migrated: VisitedRecord[] = oldData.map(name => ({
            name,
            visitedAt: Date.now()
          }));
          setVisited(migrated);
          localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(migrated));
        } catch (e) {
          console.error("Failed to migrate old data", e);
        }
      }
    }
  }, []);

  const toggleVisited = (stallName: string) => {
    setVisited((prev) => {
      const exists = prev.find(item => item.name === stallName);
      const newVisited = exists
        ? prev.filter((item) => item.name !== stallName)
        : [...prev, { name: stallName, visitedAt: Date.now() }];
      localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify(newVisited));
      return newVisited;
    });
  };

  const isVisited = (stallName: string) => {
    return visited.some(item => item.name === stallName);
  };

  return (
    <VisitedContext.Provider value={{ visited, toggleVisited, isVisited, mounted }}>
      {children}
    </VisitedContext.Provider>
  );
};

export const useVisitedContext = () => {
  const context = useContext(VisitedContext);
  if (!context) {
    throw new Error("useVisitedContext must be used within a VisitedProvider");
  }
  return context;
};
