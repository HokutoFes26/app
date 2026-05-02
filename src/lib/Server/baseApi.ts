import { supabase } from "./supabase";

interface CacheEntry<T> {
  data: T;
  time: number;
}

const cache: Record<string, CacheEntry<unknown>> = {};
const pendingRequests: Record<string, Promise<unknown> | null> = {};

export interface AppSetting {
  key: string;
  value_int: number | null;
  value_text: string | null;
  updated_at: string;
}

export const invalidateCache = (keys: string[] = ["all"]) => {
  keys.forEach((key) => {
    delete cache[key];
  });
};

export const fetchWithCache = async <T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> => {
  const now = Date.now();
  const pending = pendingRequests[key];
  if (pending) return pending as Promise<T>;
  
  const cached = cache[key] as CacheEntry<T> | undefined;
  if (cached && (ttl === Infinity || now - cached.time < ttl)) {
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
};

export const performMutation = async <T>(
  action: () => Promise<T>,
  cacheKeysToInvalidate: string[] = ["all"]
): Promise<T> => {
  const result = await action();
  invalidateCache(cacheKeysToInvalidate);
  return result;
};

export const fetchAllData = async (ttl: number = 0) => {
  return fetchWithCache(
    "all",
    async () => {
      const { data, error } = await supabase.rpc("get_all_data");
      if (error) throw error;
      return data;
    },
    ttl
  );
};
