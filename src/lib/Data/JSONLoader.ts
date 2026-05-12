import { BASE_PATH } from "@/constants/paths";

type JSONDataType = "booth"| "exhibitions" | "events" | "vote" | "bus" | "spots";

const cache: Record<string, any> = {};
const pendingRequests: Record<string, Promise<any> | null> = {};

const transformData = (type: JSONDataType, rawData: any) => {
  switch (type) {
    case "booth":
    case "spots":
    case "events":
    case "bus":
    case "exhibitions":
      return rawData;
    case "vote":
    default:
      return Array.isArray(rawData) ? rawData : [];
  }
};

export const loadJSON = async <T = any>(type: JSONDataType): Promise<T> => {
  if (cache[type]) return cache[type];
  if (pendingRequests[type]) return pendingRequests[type] as Promise<T>;

  const request = (async () => {
    try {
      const basePath = BASE_PATH;
      const response = await fetch(`${basePath}/data/${type}.json`);
      if (!response.ok) throw new Error(`Failed to load ${type}.json`);

      const rawData = await response.json();
      const processedData = transformData(type, rawData);

      cache[type] = processedData;
      pendingRequests[type] = null;
      return processedData as T;
    } catch (error) {
      pendingRequests[type] = null;
      console.error(`[JSONLoader] Error loading ${type}:`, error);
      throw error;
    }
  })();

  pendingRequests[type] = request;
  return request;
};
