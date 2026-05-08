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

export interface Exhibition {
  id: number;
  category: string;
  name: string;
  team: string;
  place: string;
  image: string;
}

export const useSpotInfo = () => {
  const searchParams = useSearchParams();
  const spotId = searchParams.get("spot");
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [allExhibitions, setAllExhibitions] = useState<Exhibition[]>([]);
  const { api: { fetchedData } } = useData();

  useEffect(() => {
    loadJSON("spots").then(setAllSpots);
    loadJSON("exhibitions").then(setAllExhibitions);
  }, []);

  const currentSpot = useMemo(() => {
    if (!spotId) return null;
    return allSpots.find((s) => s.id === spotId) || null;
  }, [spotId, allSpots]);

  const nearbyBooths = useMemo(() => {
    if (!currentSpot || !fetchedData) return [];
    const ids = [...currentSpot.nearbyStalls];
    return fetchedData.stalls.filter((s) => ids.includes(Number(s.id)));
  }, [currentSpot, fetchedData]);

  const nearbyExhibitions = useMemo(() => {
    if (!currentSpot || !allExhibitions) return [];
    const ids = [...currentSpot.nearbyExhibitions];
    return allExhibitions.filter((e) => ids.includes(e.id));
  }, [currentSpot, allExhibitions]);

  return {
    spotId,
    currentSpot,
    nearbyBooths,
    nearbyExhibitions
  };
};
