import { useMemo } from "react";
import dayjs from "dayjs";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";

export const useNewsStatus = (onlyHot: boolean, hotTime: number) => {
  const {
    api: { fetchedData, isLoading },
  } = useData();
  const { currentTime } = useAppTime();
  const news = fetchedData?.news || [];

  const processedNews = useMemo(() => {
    const nowMs = currentTime.valueOf();
    const newsWithHot = news.map((item) => {
      const diff = (nowMs - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return { ...item, isHot: diff >= -1 && diff <= hotTime };
    });

    const filtered = onlyHot ? newsWithHot.filter((n) => n.isHot) : newsWithHot;

    return filtered.sort((a, b) => {
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      return dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf();
    });
  }, [news, currentTime, onlyHot, hotTime]);

  return {
    isLoading,
    processedNews,
  };
};
