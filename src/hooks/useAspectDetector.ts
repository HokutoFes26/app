import { useState, useEffect, useRef } from "react";

const isClient = typeof window === "object";

const getInitialAspectRatio = (): boolean => {
  if (!isClient) {
    return false;
  }
  return window.innerHeight > window.innerWidth * 1.4;
};

export default function AspectDetector() {
  const [aspectRatio, setAspectRatio] = useState(getInitialAspectRatio());
  const lastWidth = useRef(isClient ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth !== lastWidth.current) {
        lastWidth.current = window.innerWidth;
        setAspectRatio(window.innerHeight > window.innerWidth * 1.4);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return aspectRatio;
}
