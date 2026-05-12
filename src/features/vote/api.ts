import { supabase } from "@/lib/Server/supabase";

export const getVoterId = async () => {
  if (typeof window === "undefined") return "";

  const COOKIE_NAME = "voter_id_v2";

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const setCookie = (name: string, value: string) => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  let localId = localStorage.getItem("voter_id");
  let cookieId = getCookie(COOKIE_NAME);

  if (!localId && cookieId) {
    localId = cookieId;
    localStorage.setItem("voter_id", localId);
  } else if (localId && !cookieId) {
    setCookie(COOKIE_NAME, localId);
  } else if (!localId && !cookieId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      localId = crypto.randomUUID();
    } else {
      localId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem("voter_id", localId);
    setCookie(COOKIE_NAME, localId);
  }

  return localId || "";
};

export const submitVote = async (targetId: string, category: string) => {
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
  const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";

  const { data, error } = await supabase.rpc("vote_for_target", {
    p_voter_id: voterId,
    p_target_id: targetId,
    p_category: category,
    p_user_agent: userAgent,
  });

  if (error) {
    console.error("[Vote] Supabase RPC Error:", error);
    throw new Error(error.message || "Failed to submit vote");
  }

  timestamps.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));

  return { success: true, data };
};

export const getMyVotes = async (voterId: string) => {
  const { data, error } = await supabase.rpc("get_my_votes", {
    p_voter_id: voterId,
  });
  if (error) {
    console.error("[Vote] getMyVotes Error:", error);
    throw new Error(error.message || "Failed to fetch my votes");
  }
  return data as { category: string; target_id: string }[];
};

export const clearVoterId = () => {
  if (typeof window === "undefined") return;
  const COOKIE_NAME = "voter_id_v2";
  localStorage.removeItem("voter_id");
  localStorage.removeItem("voted_items");
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const getVoteResults = async () => {
  const { data, error } = await supabase.rpc("get_vote_results_compressed");
  if (error) throw error;
  return data;
};

export const exportVoteData = async () => {
  const { data, error } = await supabase.rpc("export_vote_data");
  if (error) throw error;
  return data;
};
