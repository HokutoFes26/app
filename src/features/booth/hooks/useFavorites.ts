import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem("booth_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {}
  };

  useEffect(() => {
    setMounted(true);
    loadFavorites();

    const handleUpdate = () => loadFavorites();
    window.addEventListener("favorites_updated", handleUpdate);
    return () => window.removeEventListener("favorites_updated", handleUpdate);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, stallName: string) => {
    e.stopPropagation();

    let currentFavs: string[] = [];
    try {
      const stored = localStorage.getItem("booth_favorites");
      if (stored) currentFavs = JSON.parse(stored);
    } catch (e) {}

    let newFavs = [...currentFavs];
    if (newFavs.includes(stallName)) {
      newFavs = newFavs.filter((n) => n !== stallName);
    } else {
      newFavs.push(stallName);
    }

    setFavorites(newFavs);
    localStorage.setItem("booth_favorites", JSON.stringify(newFavs));
    window.dispatchEvent(new Event("favorites_updated"));
  };

  return { favorites, toggleFavorite, mounted };
}
