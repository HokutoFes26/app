"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import { loadJSON } from "@/lib/Data/JSONLoader";

function ModalContent() {
  const searchParams = useSearchParams();
  const selectedName = searchParams.get("booth-info");
  const [allStalls, setAllStalls] = useState<BoothItem[]>([]);

  useEffect(() => {
    loadJSON("booth").then(setAllStalls);
  }, []);

  const selectedBooth = useMemo(() => {
    if (!selectedName || allStalls.length === 0) return null;
    return allStalls.find((s) => s.name === selectedName) || null;
  }, [selectedName, allStalls]);

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
