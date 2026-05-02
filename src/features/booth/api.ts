import { supabase } from "@/lib/Server/supabase";
import { fetchWithCache, performMutation } from "@/lib/Server/baseApi";
import { StallStatus } from "./types";

export const fetchStallsOnly = async (ttl: number = 0) => {
  return fetchWithCache(
    "stalls_only",
    async () => {
      const { data, error } = await supabase.rpc("get_stalls_only");
      if (error) throw error;
      return data;
    },
    ttl,
  );
};

export const updateStallStatus = async (stallName: string, updates: Partial<StallStatus>) => {
  return performMutation(async () => {
    console.log(`[API] Update Sent: Stall (${stallName})`);
    const dbUpdates: Record<string, number> = {};
    if (updates.crowdLevel !== undefined) dbUpdates.crowd_level = updates.crowdLevel;
    if (updates.stockLevel !== undefined) dbUpdates.stock_level = updates.stockLevel;

    const { error } = await supabase.from("stalls_status").update(dbUpdates).eq("stall_name", stallName);

    if (error) throw error;
    return { success: true };
  }, ["all", "stalls_only"]);
};
