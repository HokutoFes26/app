type JSONDataType = "booth" | "events" | "vote" | "faq" | "bus";

const cache: Record<string, any> = {};

const transformData = (type: JSONDataType, rawData: any) => {
  switch (type) {
    case "booth":
      return [...(rawData.L1 || []), ...(rawData.L2 || []), ...(rawData.L3 || []), ...(rawData.L4 || [])];
    case "events":
    case "bus":
      return rawData;
    case "vote":
    case "faq":
    default:
      return Array.isArray(rawData) ? rawData : [];
  }
};

export const loadJSON = async <T = any>(type: JSONDataType): Promise<T> => {
  if (cache[type]) return cache[type];

  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const response = await fetch(`${basePath}/data/${type}.json`);
    if (!response.ok) throw new Error(`Failed to load ${type}.json`);

    const rawData = await response.json();
    const processedData = transformData(type, rawData);

    cache[type] = processedData;
    return processedData as T;
  } catch (error) {
    console.error(`[JSONLoader] Error loading ${type}:`, error);
    throw error;
  }
};
