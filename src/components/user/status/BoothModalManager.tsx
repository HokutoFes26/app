"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import BoothDetailModal, { BoothItem } from "./BoothDetailModal";
import stallsData from "@/../public/data/booth.json";

const allStalls: BoothItem[] = [
  ...(stallsData.L1 || []),
  ...(stallsData.L2 || []),
  ...(stallsData.L3 || []),
  ...(stallsData.L4 || []),
];

export default function BoothModalManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedBooth, setSelectedBooth] = useState<BoothItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const boothName = searchParams.get("booth-info");
    if (boothName) {
      const found = allStalls.find((s) => s.name === boothName);
      if (found) {
        setSelectedBooth(found);
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams]);

  const handleCloseModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("booth-info");
    const query = params.toString();
    const url = `${pathname}${query ? `?${query}` : ""}`;
    router.push(url, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <BoothDetailModal
      item={selectedBooth}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
    />
  );
}
