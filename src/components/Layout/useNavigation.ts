"use client";

import { useEffect, useRef } from "react";
import { TabSelector, initSwipeHandlers, initIndicatorDrag } from "@/features/main/hooks/useTabSelector";

interface UseNavigationProps {
  value: string;
  setValue: (val: string) => void;
  isMoving: boolean;
  setIsMoving: (val: boolean) => void;
  disabled?: boolean;
  tabCount: number;
}

export function useNavigation({
  value,
  setValue,
  isMoving,
  setIsMoving,
  disabled,
  tabCount,
}: UseNavigationProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const triggerMove = (prev: string, next: string) => {
    if (prev === next || disabled) return;
    setIsMoving(true);
    TabSelector(Number(next));
    setValue(next);
    setTimeout(() => setIsMoving(false), 400);
  };

  useEffect(() => {
    if (disabled) return;

    const cleanupSwipe = initSwipeHandlers((direction) => {
      if (disabled) return;
      const current = valueRef.current;
      const nextValue = Math.min(Math.max(Number(current) + direction, 0), tabCount - 1);
      const nextValueStr = String(nextValue);

      if (nextValueStr !== current) {
        setIsMoving(true);
        TabSelector(nextValue);
        setValue(nextValueStr);
        setTimeout(() => setIsMoving(false), 400);
      }
    });

    const cleanupDrag =
      indicatorRef.current && footerRef.current
        ? initIndicatorDrag(
            indicatorRef.current,
            footerRef.current,
            (nextTab) => {
              if (disabled) return;
              const current = valueRef.current;
              const nextTabStr = String(nextTab);

              if (nextTabStr !== current) {
                setIsMoving(true);
                TabSelector(nextTab);
                setValue(nextTabStr);
                setTimeout(() => setIsMoving(false), 400);
              }
            },
            tabCount,
          )
        : null;

    return () => {
      cleanupSwipe();
      if (cleanupDrag) cleanupDrag();
    };
  }, [setValue, setIsMoving, disabled, tabCount]);

  const SIDE_PADDING = 5;
  const EXTRA_WIDTH = 5.7;
  const availableWidth = 100 - SIDE_PADDING * 2;
  const slotWidth = availableWidth / tabCount;
  const indicatorWidth = slotWidth + EXTRA_WIDTH;
  const currentIndex = Number(value);
  const iconCenter = SIDE_PADDING + slotWidth * currentIndex + slotWidth / 2;
  const targetLeft = iconCenter - indicatorWidth / 2;
  const translateXPercent = (targetLeft / indicatorWidth) * 100;

  return {
    indicatorRef,
    footerRef,
    triggerMove,
    indicatorStyles: {
      width: `${indicatorWidth}%`,
      transform: `translateX(${translateXPercent}%)`,
      transition: isMoving ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
    },
    slotWidth,
    SIDE_PADDING,
  };
}
