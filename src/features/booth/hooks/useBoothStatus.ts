import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useData } from "@/contexts/DataContext";
import { useRole } from "@/contexts/RoleContext";
import { api, StatusLevel } from "@/lib/Server/api";
import { useFavorites } from "@/features/booth/hooks/useFavorites";

export const useBoothStatus = (split?: "first" | "second") => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    api: { fetchedData, isLoading, fetchData, lastUpdated, isStallsLive },
  } = useData();
  const { isAdmin, isStallAdmin, assignedStall } = useRole();
  const allStatuses = fetchedData?.stalls || [];

  const { favorites, toggleFavorite, mounted } = useFavorites();

  const statuses = useMemo(() => {
    const sortedStatuses = [...allStatuses].sort((a, b) => Number(a.id) - Number(b.id));

    if (!split) return sortedStatuses;
    const mid = Math.ceil(sortedStatuses.length / 2);
    return split === "first" ? sortedStatuses.slice(0, mid) : sortedStatuses.slice(mid);
  }, [allStatuses, split]);

  const handleStallClick = (stallName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("booth-info", stallName);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const cycleStatus = (current: StatusLevel): StatusLevel => {
    if (current === 0) return 1;
    if (current === 1) return 2;
    return 0;
  };

  const canEdit = (stallName: string) => {
    if (isAdmin) return true;
    if (isStallAdmin && assignedStall === stallName) return true;
    return false;
  };

  const handleCrowdClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!canEdit(stallName)) return;
    const newLevel = cycleStatus(currentLevel);
    await api.stalls.update(stallName, { crowdLevel: newLevel });
    fetchData();
  };

  const handleStockClick = async (stallName: string, currentLevel: StatusLevel) => {
    if (!canEdit(stallName)) return;
    const newLevel = cycleStatus(currentLevel);
    await api.stalls.update(stallName, { stockLevel: newLevel });
    fetchData();
  };

  return {
    isLoading,
    mounted,
    statuses,
    lastUpdated,
    isStallsLive,
    favorites,
    toggleFavorite,
    handleStallClick,
    handleCrowdClick,
    handleStockClick,
    canEdit,
  };
};
