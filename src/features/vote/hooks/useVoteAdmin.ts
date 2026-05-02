import { useState, useEffect, useCallback, useRef } from "react";
import { getVoteResults } from "@/features/vote/api";
import { loadJSON } from "@/lib/Data/JSONLoader";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";
interface VoteResult {
  c: string;
  i: string;
  v: number;
}
let globalCachedResults: VoteResult[] = [];
let globalLastFetchTime = 0;
let globalTargetsMap: Record<string, string> = {};
export const useVoteAdmin = () => {
  const { isAdmin } = useRole();
  const {
    api: { lastUpdated },
  } = useData();
  const [results, setResults] = useState<VoteResult[]>(globalCachedResults);
  const [targetsMap, setTargetsMap] = useState<Record<string, string>>(globalTargetsMap);
  const [localLoading, setLocalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState<number>(globalLastFetchTime);
  const lastKnownGlobalUpdate = useRef(lastUpdated);
  useEffect(() => {
    setMounted(true);
  }, []);
  const fetchVoteData = useCallback(async (force = false) => {
    const now = Date.now();
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    setLocalLoading(true);
    try {
      if (Object.keys(globalTargetsMap).length === 0) {
        const targets: any[] = await loadJSON("vote");
        const map: Record<string, string> = {};
        targets.forEach((t) => {
          map[t.id] = t.name;
        });
        globalTargetsMap = map;
        setTargetsMap(map);
      }
      if (!force && globalLastFetchTime !== 0 && now - globalLastFetchTime < FIFTEEN_MINUTES) {
        setResults([...globalCachedResults]);
        setLastUpdatedDisplay(globalLastFetchTime);
        setLocalLoading(false);
        return;
      }
      const data = await getVoteResults();
      const newResults = data || [];
      globalCachedResults = newResults;
      globalLastFetchTime = now;
      setResults(newResults);
      setLastUpdatedDisplay(now);
    } catch (e) {
      console.error("[VoteAdmin] Error:", e);
    } finally {
      setLocalLoading(false);
    }
  }, []);
  useEffect(() => {
    if (mounted && isAdmin) {
      const isManualRefresh = lastKnownGlobalUpdate.current !== lastUpdated;
      fetchVoteData(isManualRefresh);
      lastKnownGlobalUpdate.current = lastUpdated;
    }
  }, [mounted, isAdmin, lastUpdated, fetchVoteData]);
  const getRank = useCallback(
    (record: VoteResult) => {
      return results.filter((item) => item.c === record.c && item.v > record.v).length + 1;
    },
    [results],
  );
  const lastUpdatedStr = lastUpdatedDisplay
    ? new Date(lastUpdatedDisplay).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "---";
  return {
    isAdmin,
    results,
    targetsMap,
    localLoading,
    mounted,
    lastUpdatedStr,
    getRank,
    fetchVoteData,
  };
};
