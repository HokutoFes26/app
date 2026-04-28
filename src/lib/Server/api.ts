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
    post: async (item: { name: string; place: string }) => {
      console.log("[API] Update Sent: New Lost Item");
      const { error } = await supabase.from("lost_items").insert([item]);
      if (error) throw error;
      delete cache["all"];
    },
    update: async (id: string, updates: { name: string; place: string; reason: string }) => {
      console.log(`[API] Update Sent: Edit Lost Item (${id})`);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const { error } = await supabase
        .from("lost_items")
        .update({
          name: updates.name,
          place: updates.place,
          edit_reason: `${updates.reason} (${timeStr})`,
        })
        .eq("id", id);
      if (error) throw error;
      delete cache["all"];
    },
    delete: async (id: string) => {
      console.log(`[API] Update Sent: Delete Lost Item (${id})`);
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
    getVoterId: () => {
      if (typeof window === "undefined") return "";
      let id = localStorage.getItem("voter_id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("voter_id", id);
      }
      return id;
    },

    getTargets: async () => {
      const { data, error } = await supabase
        .from("vote_targets")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },

    submitVote: async (targetId: string, category: string) => {
      const voterId = api.voting.getVoterId();
      const { data, error } = await supabase.rpc("vote_for_target", {
        p_voter_id: voterId,
        p_target_id: targetId,
        p_category: category,
      });
      if (error) throw error;
      return data;
    },

    getResults: async () => {
      const { data, error } = await supabase.from("vote_results").select("*");
      if (error) throw error;
      return data;
    },
  },
};
