import { useState, useEffect, useRef, useMemo } from "react";
import { MapPins, mapList } from "@/features/map/utils/MapPins";
import { getPath } from "@/constants/paths";

export const useMapData = (initialPlace: string | null | undefined) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratio, setRatio] = useState(1.414);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOSFallbackFullscreen, setIsIOSFallbackFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCurrentlyFullscreen = isFullscreen || isIOSFallbackFullscreen;

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nativeFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(nativeFullscreen);

      if (!nativeFullscreen) {
        setIsIOSFallbackFullscreen(false);
        document.body.classList.remove("map-pseudo-fullscreen-active");
      }
      window.dispatchEvent(new Event("resize"));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.body.classList.remove("map-pseudo-fullscreen-active");
    };
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(handle);
  }, [isIOSFallbackFullscreen, activeIndex]);

  const toggleFullscreen = () => {
    const elem = containerRef.current as any;
    if (!elem) return;

    const isNativeFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (!isNativeFullscreen && !isIOSFallbackFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          document.body.classList.add("map-pseudo-fullscreen-active");
          setIsIOSFallbackFullscreen(true);
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else {
        document.body.classList.add("map-pseudo-fullscreen-active");
        setIsIOSFallbackFullscreen(true);
      }
    } else {
      if (isNativeFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
      document.body.classList.remove("map-pseudo-fullscreen-active");
      setIsIOSFallbackFullscreen(false);
    }

    window.dispatchEvent(new Event("resize"));
  };

  const pinData = useMemo(() => {
    if (!initialPlace) return null;
    return MapPins[initialPlace] || null;
  }, [initialPlace]);

  useEffect(() => {
    if (pinData) {
      setActiveIndex(pinData.mapId);
    } else if (initialPlace && initialPlace.includes("テント番号")) {
      setActiveIndex(5);
    }
  }, [pinData, initialPlace]);

  useEffect(() => {
    setIsReady(false);
    const img = new window.Image();
    img.src = getPath(mapList[activeIndex].src);
    img.onload = () => {
      setRatio(img.width / img.height);
      setIsReady(true);
    };
  }, [activeIndex]);

  const getBounds = () =>
    [
      [0, 0],
      [1000, 1000 * ratio],
    ] as [number, number][];

  const categories = Array.from(new Set(mapList.map((item) => item.category)));

  return {
    activeIndex,
    setActiveIndex,
    ratio,
    isReady,
    isCurrentlyFullscreen,
    containerRef,
    toggleFullscreen,
    getBounds,
    categories,
    mapList,
  };
};
