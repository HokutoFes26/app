"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import stallsData from "@/../public/data/booth.json";

const allStalls: BoothItem[] = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

function ModalContent() {
  const searchParams = useSearchParams();
  const selectedName = searchParams.get("booth-info");

  const selectedBooth = useMemo(() => {
    if (!selectedName) return null;
    return allStalls.find((s) => s.name === selectedName) || null;
  }, [selectedName]);

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
