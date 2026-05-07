import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useData } from "@/contexts/DataContext";

export interface Spot {
  id: string;
  location: string;
  mapImg: string | null;
  nearbyStalls: number[];
  nearbyExhibitions: number[];
}

export const useSpotInfo = () => {
  const searchParams = useSearchParams();
  const spotId = searchParams.get("spot");
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const { api: { fetchedData } } = useData();

  useEffect(() => {
    loadJSON("spots").then(setAllSpots);
  }, []);

  const currentSpot = useMemo(() => {
    if (!spotId) return null;
    return allSpots.find((s) => s.id === spotId) || null;
  }, [spotId, allSpots]);

  const nearbyBooths = useMemo(() => {
    if (!currentSpot || !fetchedData) return [];
    const ids = [...currentSpot.nearbyStalls, ...currentSpot.nearbyExhibitions];
    return fetchedData.stalls.filter((s) => ids.includes(Number(s.id)));
  }, [currentSpot, fetchedData]);

  return {
    spotId,
    currentSpot,
    nearbyBooths,
  };
};
