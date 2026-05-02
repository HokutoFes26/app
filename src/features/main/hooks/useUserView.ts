import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useData } from "@/contexts/DataContext";
import { useAppTime } from "@/contexts/TimeContext";
import { useRole } from "@/contexts/RoleContext";
import { useMapControl } from "@/contexts/MapContext";
import useColumnDetector from "@/hooks/useColumnDetector";
import useAspectDetector from "@/hooks/useAspectDetector";

export const useUserView = () => {
  const isMobile = useAspectDetector();
  const columns = useColumnDetector();
  const { isStallAdmin } = useRole();
  const { currentTime } = useAppTime();
  const {
    api: { fetchedData },
  } = useData();
  const mapControl = useMapControl();

  const [tabValue, setTabValue] = useState("0");
  const [isMoving, setIsMoving] = useState(false);
  const isMapOpen = mapControl?.isMapOpen || false;
  const setIsMapOpen = (open: boolean) => (open ? mapControl?.openMap() : mapControl?.closeMap());

  const news = fetchedData?.news || [];
  const hotTime = 20;
  
  const hasHotNews = useMemo(() => {
    const now = currentTime.valueOf();
    return news.some((item) => {
      const diffMin = (now - dayjs(item.created_at).valueOf()) / (1000 * 60);
      return diffMin > -1 && diffMin <= hotTime;
    });
  }, [news, currentTime]);

  return {
    isMobile,
    columns,
    isStallAdmin,
    tabValue,
    setTabValue,
    isMoving,
    setIsMoving,
    isMapOpen,
    setIsMapOpen,
    hasHotNews,
    hotTime,
    targetPlace: mapControl?.targetPlace,
    openMap: () => mapControl?.openMap(),
  };
};
