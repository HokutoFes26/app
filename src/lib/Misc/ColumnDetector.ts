import { useState, useEffect } from "react";

export default function useColumnDetector() {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1600) setColumns(4);
      else if (w >= 1200) setColumns(3);
      else setColumns(2);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return columns;
}
