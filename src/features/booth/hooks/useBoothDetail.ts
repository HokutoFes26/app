"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMapControl } from "@/contexts/MapContext";
import { BoothItem } from "../components/BoothDetailModal";

export function useBoothDetail(item: BoothItem) {
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHiddenFromUrl = searchParams.get("hidden") === "true";
  const [showHidden, setShowHidden] = useState(isHiddenFromUrl);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const mapControl = useMapControl();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHiddenFromUrl && item?.image_hidden && Math.random() < 0.35) {
      setShowHidden(true);
    }
  }, [isHiddenFromUrl, item?.name, item?.image_hidden]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 10);
      if (mapControl) mapControl.setProductModalOpen(true);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      if (mapControl) mapControl.setProductModalOpen(false);
    }
  }, [isOpen, mapControl]);

  useEffect(() => {
    if (isMenuExpanded && modalRef.current) {
      const scrollTarget = modalRef.current;
      const timer = setTimeout(() => {
        scrollTarget.scrollTo({
          top: scrollTarget.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMenuExpanded]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const handleLocationClick = () => {
    if (mapControl && item.place) {
      setIsOpen(false);
      mapControl.openMap(item.place);
      setTimeout(() => {
        router.back();
      }, 300);
    }
  };

  const handleShare = async (title: string, text: string) => {
    const shareUrl = window.location.href;
    const shareData = {
      title,
      text,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("URLをクリップボードにコピーしました");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

  return {
    show,
    isOpen,
    showHidden,
    isMenuExpanded,
    setIsMenuExpanded,
    modalRef,
    handleClose,
    handleLocationClick,
    handleShare,
    mapControl,
  };
}
