import { createContext, useContext } from "react";
import { StallStatus, NewsItem, LostItem, Question } from "@/lib/Server/mockSupabase";

export interface FetchedData {
  stalls: StallStatus[];
  news: NewsItem[];
  lostItems: LostItem[];
  questions: Question[];
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
