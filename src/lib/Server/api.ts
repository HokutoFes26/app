"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase] Environment variables for Supabase are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type StatusLevel = 0 | 1 | 2; // 0:green, 1:yellow, 2:red

export interface StallStatus {
  id: number | string;
  stallName: string;
  crowdLevel: StatusLevel;
  stockLevel: StatusLevel;
}

export interface LostItem {
  id: string;
  name: string;
  place: string;
  photo_path?: string;
  created_at: string;
  edit_reason?: string;
}

export interface Question {
  id: string;
  text: string;
  answer: string | null;
  created_at: string;
  edit_reason?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  edit_reason?: string;
}

interface CacheEntry<T> {
  data: T;
  time: number;
}

const cache: Record<string, CacheEntry<unknown>> = {};
const pendingRequests: Record<string, Promise<unknown> | null> = {};
let loginPromise: Promise<any> | null = null;

export interface AppSetting {
  key: string;
  value_int: number | null;
  value_text: string | null;
  updated_at: string;
}

export const api = {
  auth: {
    loginAsAdmin: async (password: string) => {
      const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!email) throw new Error("Admin email is not configured");
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user.email === email) {
        console.log("[API] Auth: Already logged in as Admin");
        return { user: sessionData.session.user };
      }
      if (loginPromise) return loginPromise;
      console.log("[API] Auth: Admin Login Attempt");
      loginPromise = supabase.auth
        .signInWithPassword({ email, password })
        .then((res) => {
          loginPromise = null;
          if (res.error) throw res.error;
          return res.data;
        })
        .catch((err) => {
          loginPromise = null;
          throw err;
        });
      return loginPromise;
    },

    loginAsStallAdmin: async (password?: string) => {
      const email = process.env.NEXT_PUBLIC_BOOTH_ADMIN_EMAIL;
      const defaultPassword = process.env.NEXT_PUBLIC_BOOTH_ADMIN_PASSWORD;
      const pass = password || defaultPassword;

      if (!email) throw new Error("Booth admin email is not configured");
      if (!pass) throw new Error("Booth admin password is not configured");

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user.email === email) {
        console.log("[API] Auth: Already logged in as Booth Admin");
        return { user: sessionData.session.user };
      }
      if (loginPromise) return loginPromise;
      console.log("[API] Auth: Booth Admin Login Attempt");
      loginPromise = supabase.auth
        .signInWithPassword({ email, password: pass })
        .then((res) => {
          loginPromise = null;
          if (res.error) throw res.error;
          return res.data;
        })
        .catch((err) => {
          loginPromise = null;
          throw err;
        });
      return loginPromise;
    },

    fetchSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session fetch error:", error);
        return null;
      }
      return data.session;
    },
  },

  _fetchWithCache: async <T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> => {
    const now = Date.now();
    const pending = pendingRequests[key];
    if (pending) return pending as Promise<T>;
    const cached = cache[key] as CacheEntry<T> | undefined;
    if (cached && now - cached.time < ttl) {
      return cached.data;
    }
    console.log(`[API] Network Request: ${key}`);
    const requestPromise = fetcher()
      .then((data) => {
        cache[key] = { data, time: Date.now() };
        pendingRequests[key] = null;
        return data;
      })
      .catch((err) => {
        pendingRequests[key] = null;
        throw err;
      });
    pendingRequests[key] = requestPromise;
    return requestPromise as Promise<T>;
  },

  fetchAllData: async (ttl: number = 0) => {
    return api._fetchWithCache(
      "all",
      async () => {
        const { data, error } = await supabase.rpc("get_all_data");
        if (error) throw error;
        return data;
      },
      ttl,
    );
  },

  fetchStallsOnly: async (ttl: number = 0) => {
    return api._fetchWithCache(
      "stalls_only",
      async () => {
        const { data, error } = await supabase.rpc("get_stalls_only");
        if (error) throw error;
        return data;
      },
      ttl,
    );
  },

  stalls: {
    update: async (stallName: string, updates: Partial<StallStatus>) => {
      console.log(`[API] Update Sent: Stall (${stallName})`);
      const dbUpdates: Record<string, number> = {};
      if (updates.crowdLevel !== undefined) dbUpdates.crowd_level = updates.crowdLevel;
      if (updates.stockLevel !== undefined) dbUpdates.stock_level = updates.stockLevel;
      const { error } = await supabase.from("stalls_status").update(dbUpdates).eq("stall_name", stallName);
      if (error) throw error;
      delete cache["all"];
      delete cache["stalls_only"];
    },
  },

  lostAndFound: {
    post: async (item: { name: string; place: string; photo_path?: string }) => {
      console.log("[API] Update Sent: New Lost Item");
      const { error } = await supabase.from("lost_items").insert([item]);
      if (error) throw error;
      delete cache["all"];
    },
    update: async (id: string, updates: { name: string; place: string; reason: string; photo_path?: string }) => {
      console.log(`[API] Update Sent: Edit Lost Item (${id})`);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const { error } = await supabase
        .from("lost_items")
        .update({
          name: updates.name,
          place: updates.place,
          photo_path: updates.photo_path,
          edit_reason: `${updates.reason} (${timeStr})`,
        })
        .eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
    delete: async (id: string, photoPath?: string) => {
      if (photoPath) {
        try {
          await api.storage.deleteImage(photoPath);
        } catch (e) {
          console.warn("[API] Storage deletion failed:", e);
        }
      }

      const { error } = await supabase.from("lost_items").delete().eq("id", id);
      if (error) throw error;

      delete cache["all"];
    },
  },

  qa: {
    ask: async (text: string) => {
      console.log("[API] Update Sent: New Question");
      const { error } = await supabase.from("questions").insert([{ text }]);
      if (error) throw error;
      delete cache["all"];
    },
    reply: async (id: string, answer: string, reason?: string) => {
      console.log(`[API] Update Sent: Reply/Edit Question (${id})`);
      const updates: { answer: string; edit_reason?: string } = { answer };
      if (reason && reason.trim() !== "") {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        updates.edit_reason = `${reason} (${timeStr})`;
      }
      const { error } = await supabase.from("questions").update(updates).eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
    delete: async (id: string) => {
      console.log(`[API] Update Sent: Delete Question (${id})`);
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
  },

  news: {
    post: async (title: string, content: string) => {
      console.log("[API] Update Sent: New News");
      const { error } = await supabase.from("news").insert([{ title, content }]);
      if (error) throw error;
      delete cache["all"];
    },
    update: async (id: string, updates: { title: string; content: string; reason: string }) => {
      console.log(`[API] Update Sent: Edit News (${id})`);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const { error } = await supabase
        .from("news")
        .update({
          title: updates.title,
          content: updates.content,
          edit_reason: `${updates.reason} (${timeStr})`,
        })
        .eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
    delete: async (id: string) => {
      console.log(`[API] Update Sent: Delete News (${id})`);
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
  },

  voting: {
    getVoterId: async () => {
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
    },

    submitVote: async (targetId: string, category: string) => {
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

      const voterId = await api.voting.getVoterId();
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
    },

    getResults: async () => {
      const { data, error } = await supabase.rpc("get_vote_results_compressed");
      if (error) throw error;
      return data;
    },
  },

  storage: {
    uploadImage: async (file: File, bucket: string = "lost-items") => {
      const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { path: filePath, publicUrl: data.publicUrl };
    },
    getPublicUrl: (path: string, bucket: string = "lost-items") => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
    deleteImage: async (path: string, bucket: string = "lost-items") => {
      const cleanPath = path.trim().replace(/^\/+/, "");
      const { data, error } = await supabase.storage.from(bucket).remove([cleanPath]);

      if (error) throw error;
      return data;
    },
  },
};
