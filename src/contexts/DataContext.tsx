import { createContext, useContext } from "react";
import { StallStatus } from "@/features/booth/types";
import { NewsItem } from "@/features/news/types";
import { LostItem } from "@/features/lost/types";
import { Question } from "@/features/qa/types";;

export interface FetchedData {
  stalls: StallStatus[];
  news: NewsItem[];
  lostItems: LostItem[];
  questions: Question[];
  config: Record<string, number | null>;
}

export type DataContextType = {
  api: {
    fetchedData: FetchedData | null;
    isLoading: boolean;
    isPosting: boolean;
    error: string;
    fetchData: () => Promise<void>;
    handlePost: (mode: number) => void;
    askQuestion: (text: string) => Promise<void>;
    lastUpdated: number;
    isStallsLive: boolean;
  };
  work: any;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a RoleProvider");
  }
  return context;
};
