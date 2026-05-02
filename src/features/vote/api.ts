import { supabase } from "@/lib/Server/supabase";
import { AppSetting, fetchWithCache } from "@/lib/Server/baseApi";

export const getVoterId = async () => {
  if (typeof window === "undefined") return "";
  let ip = "";
  try {
    const res = await fetch("https://api64.ipify.org?format=json");
    const data = await res.json();
    ip = data.ip;
  } catch (e) {
    console.warn("[Vote] Failed to fetch IP, falling back to localStorage ID only");
  }

  let localId = localStorage.getItem("voter_id");
  if (!localId) {
    localId = crypto.randomUUID();
    localStorage.setItem("voter_id", localId);
  }

  return ip ? `ip:${ip}` : localId;
};

export const submitVote = async (targetId: string, category: string) => {
  const { data: settings } = await supabase.from("app_settings").select("*");
  const startSetting = (settings as AppSetting[] | null)?.find((s) => s.key === "vote_start_at")?.value_int;
  const endSetting = (settings as AppSetting[] | null)?.find((s) => s.key === "vote_end_at")?.value_int;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (startSetting !== undefined && startSetting !== null && nowSeconds < startSetting) {
    throw new Error("投票はまだ開始されていません");
  }
  if (endSetting !== undefined && endSetting !== null && nowSeconds > endSetting) {
    throw new Error("投票期間は終了しました");
  }

  const RATE_LIMIT_KEY = "vote_timestamps";
  const WINDOW_MS = 60 * 1000;
  const MAX_VOTES = 5;

  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  let timestamps: number[] = stored ? JSON.parse(stored) : [];
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_VOTES) {
    throw new Error("投票のリクエストが多すぎます。しばらく待ってから再度お試しください。");
  }

  const voterId = await getVoterId();
  const { data, error } = await supabase.rpc("vote_for_target", {
    p_voter_id: voterId,
    p_target_id: targetId,
    p_category: category,
  });

  if (error) {
    console.error("[Vote] Supabase RPC Error:", error);
    throw new Error(error.message || "Failed to submit vote");
  }

  timestamps.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));

  return { success: true, data };
};

export const getVoteResults = async () => {
  const { data, error } = await supabase.rpc("get_vote_results_compressed");
  if (error) throw error;
  return data;
};
