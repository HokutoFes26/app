"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { Exhibition } from "@/features/map/hooks/useSpotInfo";

function ModalContent() {
  const searchParams = useSearchParams();
  const selectedName = searchParams.get("booth-info");
  const checkinName = searchParams.get("checkin");

  const [allStalls, setAllStalls] = useState<BoothItem[]>([]);
  const [allExhibitions, setAllExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    loadJSON("booth").then(setAllStalls);
    loadJSON("exhibitions").then(setAllExhibitions);
  }, []);

  const selectedBooth = useMemo(() => {
    const targetName = selectedName || checkinName;
    if (!targetName) return null;
    const stall = allStalls.find((s) => s.name === selectedName);
    if (stall) return stall;

    const exhibition = allExhibitions.find((e) => e.name === selectedName);
    if (exhibition) {
      return {
        name: exhibition.name,
        team: exhibition.team,
        place: exhibition.place,
        image: exhibition.image,
      } as BoothItem;
    }

    return null;
  }, [selectedName, allStalls, allExhibitions]);

  if (!selectedBooth) return null;

  return <BoothDetailModal item={selectedBooth} />;
}

export default function BoothModalManager() {
  return (
    <Suspense fallback={null}>
      <ModalContent />
    </Suspense>
  );
}
