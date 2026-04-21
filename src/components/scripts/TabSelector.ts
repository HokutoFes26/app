export const TabSelector = (props: number) => {
  const canvas = document.getElementById("canvas") as HTMLElement;
  if (!canvas) return;

  if (props === 0) {
    canvas.style.left = "0";
  } else if (props === 1) {
    canvas.style.transition = "0.3s";
    canvas.style.left = "-100%";
  } else if (props === 2) {
    canvas.style.left = "-200%";
  }
};

export const initSwipeHandlers = (onSwipe: (direction: number) => void) => {
  const minimumDistance = 30;
  let startX = 0;
  let startY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].pageX;
    const endY = e.changedTouches[0].pageY;
    const distanceX = Math.abs(endX - startX);
    const distanceY = Math.abs(endY - startY);

    if (distanceX > distanceY * 1.5 && distanceX > minimumDistance) {
      onSwipe(endX - startX > 0 ? -1 : 1);
    }
  };

  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchend", handleTouchEnd);
  return () => {
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  };
};

export const initIndicatorDrag = (
  indicator: HTMLElement,
  container: HTMLElement,
  onTabChange: (index: number) => void,
) => {
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let initialLeft = 0;

  const handleStart = (e: TouchEvent | MouseEvent) => {
    isDragging = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startX = clientX;

    const transform = window.getComputedStyle(indicator).transform;
    if (transform !== "none") {
      const matrix = new DOMMatrix(transform);
      initialLeft = matrix.m41;
    }
    indicator.style.transition = "none";
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    currentX = initialLeft + deltaX;

    const maxDelta = container.offsetWidth * 0.666;
    currentX = Math.max(0, Math.min(currentX, maxDelta));

    indicator.style.transform = `translateX(${currentX}px) scaleX(1.1)`;
  };

  const handleEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    const containerWidth = container.offsetWidth;
    const tabWidth = containerWidth / 3;
    const nearestTab = Math.round(currentX / tabWidth);
    const finalTab = Math.min(Math.max(nearestTab, 0), 2);

    indicator.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    onTabChange(finalTab);
  };

  indicator.addEventListener("touchstart", handleStart);
  window.addEventListener("touchmove", handleMove, { passive: false });
  window.addEventListener("touchend", handleEnd);

  return () => {
    indicator.removeEventListener("touchstart", handleStart);
    window.removeEventListener("touchmove", handleMove);
    window.removeEventListener("touchend", handleEnd);
  };
};
